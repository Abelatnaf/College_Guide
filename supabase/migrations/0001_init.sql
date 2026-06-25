-- UniPath — initial schema.
--
-- Stores ONLY user-specific data. Universities and majors stay in static TS and
-- are referenced by slug (soft text references — there is no universities table,
-- so there are no foreign keys to one). Every table FKs to auth.users and is
-- protected by owner-only Row Level Security.

create extension if not exists pgcrypto;

-- ── shared helpers ──────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── saved_universities (shortlist) ──────────────────────────────────────────
create table if not exists public.saved_universities (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  university_slug text not null,
  note            text,
  created_at      timestamptz not null default now(),
  unique (user_id, university_slug)
);
create index if not exists saved_universities_user_idx on public.saved_universities(user_id);

-- ── student_academic_profile (single row per user) ──────────────────────────
create table if not exists public.student_academic_profile (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  gpa               numeric(3,2),
  sat               int,
  act               int,
  toefl             int,
  ielts             numeric(2,1),
  intended_major    text,
  preferred_regions text[] not null default '{}',
  budget_band       text,
  campus_size       text,
  updated_at        timestamptz not null default now()
);
drop trigger if exists student_academic_profile_set_updated_at on public.student_academic_profile;
create trigger student_academic_profile_set_updated_at
  before update on public.student_academic_profile
  for each row execute function public.set_updated_at();

-- ── applications (per-school tracker) ────────────────────────────────────────
do $$
begin
  create type public.application_status as enum
    ('considering','planning','in_progress','submitted','accepted','rejected','waitlisted','deferred');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  university_slug text not null,
  status          public.application_status not null default 'considering',
  deadline        date,
  submitted_at    timestamptz,
  notes           text,
  -- Checklist items live inline as JSON: [{ id, label, done, dueDate }]. They are
  -- always loaded with their parent application and never queried independently,
  -- so a JSONB column is simpler than a child table (no slug→uuid mapping needed).
  checklist       jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, university_slug)
);
create index if not exists applications_user_idx on public.applications(user_id);
drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- ── cost_scenarios (saved Cost/ROI runs) ─────────────────────────────────────
create table if not exists public.cost_scenarios (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text,
  university_slug text not null,
  major_slug      text,
  inputs          jsonb not null default '{}'::jsonb,
  results         jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists cost_scenarios_user_idx on public.cost_scenarios(user_id);
drop trigger if exists cost_scenarios_set_updated_at on public.cost_scenarios;
create trigger cost_scenarios_set_updated_at
  before update on public.cost_scenarios
  for each row execute function public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles                 enable row level security;
alter table public.saved_universities       enable row level security;
alter table public.student_academic_profile enable row level security;
alter table public.applications             enable row level security;
alter table public.cost_scenarios           enable row level security;

-- profiles (PK is the user id)
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- saved_universities
drop policy if exists saved_select_own on public.saved_universities;
drop policy if exists saved_insert_own on public.saved_universities;
drop policy if exists saved_update_own on public.saved_universities;
drop policy if exists saved_delete_own on public.saved_universities;
create policy saved_select_own on public.saved_universities for select using (auth.uid() = user_id);
create policy saved_insert_own on public.saved_universities for insert with check (auth.uid() = user_id);
create policy saved_update_own on public.saved_universities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy saved_delete_own on public.saved_universities for delete using (auth.uid() = user_id);

-- student_academic_profile
drop policy if exists profile_select_own on public.student_academic_profile;
drop policy if exists profile_insert_own on public.student_academic_profile;
drop policy if exists profile_update_own on public.student_academic_profile;
drop policy if exists profile_delete_own on public.student_academic_profile;
create policy profile_select_own on public.student_academic_profile for select using (auth.uid() = user_id);
create policy profile_insert_own on public.student_academic_profile for insert with check (auth.uid() = user_id);
create policy profile_update_own on public.student_academic_profile for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy profile_delete_own on public.student_academic_profile for delete using (auth.uid() = user_id);

-- applications
drop policy if exists applications_select_own on public.applications;
drop policy if exists applications_insert_own on public.applications;
drop policy if exists applications_update_own on public.applications;
drop policy if exists applications_delete_own on public.applications;
create policy applications_select_own on public.applications for select using (auth.uid() = user_id);
create policy applications_insert_own on public.applications for insert with check (auth.uid() = user_id);
create policy applications_update_own on public.applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy applications_delete_own on public.applications for delete using (auth.uid() = user_id);

-- cost_scenarios
drop policy if exists cost_select_own on public.cost_scenarios;
drop policy if exists cost_insert_own on public.cost_scenarios;
drop policy if exists cost_update_own on public.cost_scenarios;
drop policy if exists cost_delete_own on public.cost_scenarios;
create policy cost_select_own on public.cost_scenarios for select using (auth.uid() = user_id);
create policy cost_insert_own on public.cost_scenarios for insert with check (auth.uid() = user_id);
create policy cost_update_own on public.cost_scenarios for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy cost_delete_own on public.cost_scenarios for delete using (auth.uid() = user_id);
