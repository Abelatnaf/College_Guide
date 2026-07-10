-- Parent/counselor read-only sharing. Deliberately does NOT touch the RLS
-- policies on profiles / saved_universities / student_academic_profile /
-- applications from 0001_init.sql — those already-shipped owner-only
-- guarantees stay exactly as they are. Everything here is additive: a new
-- `shares` table plus SECURITY DEFINER functions that read the existing
-- tables for an accepted grantee, without needing any change to those
-- tables' own policies.

create table if not exists public.shares (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  grantee_email text not null,
  -- Filled in once the invited email actually signs in and accepts. Nullable
  -- until then — the owner doesn't need to know if that email already has an
  -- account.
  grantee_id    uuid references auth.users(id) on delete cascade,
  scope         text[] not null default array['profile','applications','shortlist'],
  status        text not null default 'pending' check (status in ('pending','accepted','revoked')),
  created_at    timestamptz not null default now(),
  accepted_at   timestamptz,
  unique (owner_id, grantee_email),
  constraint shares_scope_valid check (scope <@ array['profile','applications','shortlist']::text[])
);
create index if not exists shares_owner_idx on public.shares(owner_id);
create index if not exists shares_grantee_id_idx on public.shares(grantee_id);
create index if not exists shares_grantee_email_idx on public.shares(lower(grantee_email));

alter table public.shares enable row level security;

-- Owner manages invites they created.
create policy shares_select_owner on public.shares for select using (auth.uid() = owner_id);
create policy shares_insert_owner on public.shares for insert with check (auth.uid() = owner_id);
create policy shares_delete_owner on public.shares for delete using (auth.uid() = owner_id); -- revoke

-- Grantee can see invites addressed to their verified email (pending) or
-- already tied to their uid (accepted) — Supabase JWTs carry an `email` claim.
create policy shares_select_grantee on public.shares for select
  using (
    auth.uid() = grantee_id
    or (grantee_id is null and lower(grantee_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );

-- The ONLY thing a grantee can ever write: accept an invite addressed to them.
create policy shares_update_grantee_accept on public.shares for update
  using (lower(grantee_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (grantee_id = auth.uid() and status = 'accepted');

create or replace function public.shares_set_accepted_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    new.accepted_at = now();
  end if;
  return new;
end;
$$;
drop trigger if exists shares_set_accepted_at on public.shares;
create trigger shares_set_accepted_at before update on public.shares
  for each row execute function public.shares_set_accepted_at();

-- ── read-only, scope-checked views for accepted grantees — base tables' RLS
-- is completely untouched by everything below ──
create or replace function public.get_shared_profile(p_owner_id uuid)
returns table (gpa numeric, sat int, act int, toefl int, ielts numeric,
  intended_major text, preferred_regions text[], budget_band text, campus_size text, updated_at timestamptz)
language sql security definer set search_path = public stable
as $$
  select p.gpa, p.sat, p.act, p.toefl, p.ielts, p.intended_major, p.preferred_regions, p.budget_band, p.campus_size, p.updated_at
  from public.student_academic_profile p
  where p.user_id = p_owner_id
    and exists (select 1 from public.shares s where s.owner_id = p_owner_id
      and s.grantee_id = auth.uid() and s.status = 'accepted' and 'profile' = any(s.scope));
$$;
grant execute on function public.get_shared_profile(uuid) to authenticated;

create or replace function public.get_shared_applications(p_owner_id uuid)
returns table (university_slug text, status public.application_status, deadline date,
  submitted_at timestamptz, notes text, checklist jsonb, created_at timestamptz, updated_at timestamptz)
language sql security definer set search_path = public stable
as $$
  select a.university_slug, a.status, a.deadline, a.submitted_at, a.notes, a.checklist, a.created_at, a.updated_at
  from public.applications a
  where a.user_id = p_owner_id
    and exists (select 1 from public.shares s where s.owner_id = p_owner_id
      and s.grantee_id = auth.uid() and s.status = 'accepted' and 'applications' = any(s.scope));
$$;
grant execute on function public.get_shared_applications(uuid) to authenticated;

create or replace function public.get_shared_shortlist(p_owner_id uuid)
returns table (university_slug text, note text, created_at timestamptz)
language sql security definer set search_path = public stable
as $$
  select sv.university_slug, sv.note, sv.created_at
  from public.saved_universities sv
  where sv.user_id = p_owner_id
    and exists (select 1 from public.shares s where s.owner_id = p_owner_id
      and s.grantee_id = auth.uid() and s.status = 'accepted' and 'shortlist' = any(s.scope));
$$;
grant execute on function public.get_shared_shortlist(uuid) to authenticated;

create or replace function public.list_shared_with_me()
returns table (owner_id uuid, owner_display_name text, scope text[], accepted_at timestamptz)
language sql security definer set search_path = public stable
as $$
  select s.owner_id, p.display_name, s.scope, s.accepted_at
  from public.shares s join public.profiles p on p.id = s.owner_id
  where s.grantee_id = auth.uid() and s.status = 'accepted';
$$;
grant execute on function public.list_shared_with_me() to authenticated;
