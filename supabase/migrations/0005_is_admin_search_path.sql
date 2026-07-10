-- Harden is_admin() against search_path hijacking (flagged by the Supabase
-- security linter after 0004_payments.sql).
create or replace function public.is_admin()
returns boolean language sql stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
