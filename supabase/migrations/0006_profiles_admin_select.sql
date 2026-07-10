-- Admins need to read every submitter's profile (display name) to review
-- payment_submissions, not just their own row.
drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());
