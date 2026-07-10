-- is_admin() queried public.profiles as the calling user, which is itself
-- RLS-protected by a policy (profiles_select_admin) that calls is_admin()
-- again -- infinite recursion whenever it needed to check someone ELSE's row
-- (e.g. the admin dashboard reading other users' payment_submissions), which
-- Postgres surfaces as a 500. SECURITY DEFINER makes this function run as its
-- owner (the table owner), which bypasses RLS on profiles entirely for this
-- one lookup, breaking the cycle.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
