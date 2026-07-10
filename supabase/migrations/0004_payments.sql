-- UniPath — payment gating.
--
-- Manual payment-proof flow: users pick a tier, upload a screenshot of a
-- Telebirr/bank transfer, and an admin approves or rejects it by hand.
-- No payment processor is involved. Admin status lives on profiles so it can
-- be granted without a redeploy.

do $$
begin
  create type public.access_tier as enum ('basic', 'standard', 'premium');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end
$$;

alter table public.profiles
  add column if not exists is_admin      boolean not null default false,
  add column if not exists access_tier   public.access_tier,
  add column if not exists access_status public.payment_status;

-- ── payment_submissions (one row per screenshot a user uploads) ─────────────
create table if not exists public.payment_submissions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  tier             public.access_tier not null,
  amount_etb       numeric(10,2) not null,
  method           text not null check (method in ('telebirr', 'abyssinia')),
  screenshot_path  text not null,
  status           public.payment_status not null default 'pending',
  rejection_reason text,
  reviewed_by      uuid references auth.users(id),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists payment_submissions_user_idx on public.payment_submissions(user_id);
create index if not exists payment_submissions_status_idx on public.payment_submissions(status);

-- ── admin check (reads the caller's own profile row, so no elevated rights
--    are needed — RLS on profiles already lets a user select their own row) ──
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.payment_submissions enable row level security;

drop policy if exists payment_select_own_or_admin on public.payment_submissions;
drop policy if exists payment_insert_own on public.payment_submissions;
drop policy if exists payment_update_admin on public.payment_submissions;
create policy payment_select_own_or_admin on public.payment_submissions
  for select using (auth.uid() = user_id or public.is_admin());
create policy payment_insert_own on public.payment_submissions
  for insert with check (auth.uid() = user_id);
create policy payment_update_admin on public.payment_submissions
  for update using (public.is_admin()) with check (public.is_admin());

-- Admins may also flip a user's tier/status on profiles directly (used by the
-- approve/reject action). Owner-only policy from 0001_init.sql stays as-is;
-- this is an additional permissive policy, so either condition grants access.
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ── Storage bucket for payment screenshots (private) ────────────────────────
insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

drop policy if exists payment_screenshots_insert_own on storage.objects;
drop policy if exists payment_screenshots_read_own_or_admin on storage.objects;
create policy payment_screenshots_insert_own on storage.objects
  for insert with check (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy payment_screenshots_read_own_or_admin on storage.objects
  for select using (
    bucket_id = 'payment-screenshots'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
