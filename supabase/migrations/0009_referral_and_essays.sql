-- Referral code capture on payment submissions (manual, admin-visible — no
-- automated discount logic, just capture + display for the admin to act on).
alter table public.payment_submissions
  add column if not exists referral_code text;

-- Per-application essay tracker, alongside the existing checklist jsonb column.
alter table public.applications
  add column if not exists essays jsonb not null default '[]'::jsonb;
