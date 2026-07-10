-- Auto-grant admin to the two designated owner emails at signup time, so a
-- second admin account doesn't need a manual DB update once it's created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email in ('blendawit6@gmail.com', 'abelatnafu.g@gmail.com')
  )
  on conflict (id) do update set is_admin = excluded.is_admin;
  return new;
end;
$$;

-- Grant admin immediately to the account that already exists.
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'abelatnafu.g@gmail.com');
