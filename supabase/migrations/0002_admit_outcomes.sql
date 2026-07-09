-- Anonymous, self-reported admission outcomes. There is NO public read access
-- to raw rows anywhere in this file — the only public-facing read surface is
-- a pair of SECURITY DEFINER functions that return bucketed counts with a
-- k-anonymity floor (n >= 5 per bucket), so no aggregate can ever imply a
-- specific person's stats. Fills the documented gap in src/lib/chances.ts
-- ("no real per-school GPA/SAT admit bands exist in the dataset").

create table if not exists public.admit_outcomes (
  id               uuid primary key default gen_random_uuid(),
  -- Null for anonymous (not signed-in) submitters, by design — true
  -- anonymity, the row can never be retrieved/edited/deleted again.
  user_id          uuid references auth.users(id) on delete cascade,
  -- Soft reference, no FK — mirrors the "no universities table" convention
  -- from 0001_init.sql.
  university_slug  text not null check (length(university_slug) > 0),
  gpa              numeric(3,2) check (gpa is null or (gpa >= 0 and gpa <= 4)),
  sat              int check (sat is null or (sat >= 400 and sat <= 1600)),
  act              int check (act is null or (act >= 1 and act <= 36)),
  decision         text not null check (decision in ('accepted','rejected','waitlisted','deferred')),
  decision_round   text check (decision_round is null or decision_round in ('ED','EA','RD','Rolling')),
  created_at       timestamptz not null default now(),
  constraint admit_outcomes_has_signal check (gpa is not null or sat is not null or act is not null)
);
create index if not exists admit_outcomes_slug_idx on public.admit_outcomes(university_slug);
-- One outcome per school per signed-in user (cheap anti-spam for the identifiable path).
create unique index if not exists admit_outcomes_user_slug_uniq
  on public.admit_outcomes(user_id, university_slug) where user_id is not null;

alter table public.admit_outcomes enable row level security;

-- Insert: signed-in users must own the row; anonymous submitters must leave user_id null.
create policy admit_outcomes_insert on public.admit_outcomes
  for insert to anon, authenticated
  with check (
    (auth.uid() is not null and auth.uid() = user_id)
    or (auth.uid() is null and user_id is null)
  );

-- Select/update/delete: owner-only, same pattern as every other table. This
-- is the ONLY read path to raw rows — no policy grants any other user read
-- access, ever.
create policy admit_outcomes_select_own on public.admit_outcomes
  for select using (auth.uid() is not null and auth.uid() = user_id);
create policy admit_outcomes_update_own on public.admit_outcomes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy admit_outcomes_delete_own on public.admit_outcomes
  for delete using (auth.uid() = user_id);

-- ── public read surface: bucketed aggregates only, k-anonymity floor = 5 ──
create or replace function public.get_admit_outcome_stats(p_university_slug text)
returns table (metric text, band text, decision text, n bigint)
language sql
security definer
set search_path = public
stable
as $$
  with gpa_rows as (
    select 'gpa'::text as metric,
      case when gpa < 3.0 then '<3.0' when gpa < 3.3 then '3.0-3.3'
           when gpa < 3.7 then '3.3-3.7' when gpa < 3.9 then '3.7-3.9'
           else '3.9-4.0' end as band,
      decision
    from public.admit_outcomes
    where university_slug = p_university_slug and gpa is not null
  ),
  sat_rows as (
    select 'sat'::text, case when sat < 1200 then '<1200' when sat < 1350 then '1200-1350'
           when sat < 1450 then '1350-1450' when sat < 1550 then '1450-1550'
           else '1550-1600' end, decision
    from public.admit_outcomes where university_slug = p_university_slug and sat is not null
  ),
  act_rows as (
    select 'act'::text, case when act < 27 then '<27' when act < 31 then '27-30'
           when act < 34 then '31-33' else '34-36' end, decision
    from public.admit_outcomes where university_slug = p_university_slug and act is not null
  ),
  unioned as (
    select * from gpa_rows union all select * from sat_rows union all select * from act_rows
  )
  select metric, band, decision, count(*) as n
  from unioned
  group by metric, band, decision
  having count(*) >= 5   -- suppress sparse buckets: no bucket is ever small enough to imply one person
  order by metric, band, decision;
$$;
grant execute on function public.get_admit_outcome_stats(text) to anon, authenticated;

-- A bare total (no decision/band breakdown) doesn't leak per-person stats even
-- when small, so it has no floor — lets the UI say "3 students have shared
-- data — not enough yet for a breakdown" instead of showing nothing.
create or replace function public.get_admit_outcome_total(p_university_slug text)
returns bigint
language sql security definer set search_path = public stable
as $$ select count(*) from public.admit_outcomes where university_slug = p_university_slug; $$;
grant execute on function public.get_admit_outcome_total(text) to anon, authenticated;
