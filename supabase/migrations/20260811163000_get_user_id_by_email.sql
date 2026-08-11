-- Lets admins resolve auth.users.id from an email address without needing a
-- service-role key on the server. profiles has no email column, so this is
-- the only way to go from "owner email" (typed in the admin UI) -> user id.
--
-- SECURITY DEFINER is required to read auth.users, but the function checks
-- has_role(auth.uid(), 'admin') itself before returning anything, so a
-- non-admin caller always gets NULL regardless of what they pass in.
create or replace function public.get_user_id_by_email(_email text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  _uid uuid;
begin
  if not public.has_role(auth.uid(), 'admin'::app_role) then
    return null;
  end if;

  select id into _uid
  from auth.users
  where lower(email) = lower(trim(_email))
  limit 1;

  return _uid;
end;
$$;

revoke execute on function public.get_user_id_by_email(text) from public, anon;
grant execute on function public.get_user_id_by_email(text) to authenticated;
