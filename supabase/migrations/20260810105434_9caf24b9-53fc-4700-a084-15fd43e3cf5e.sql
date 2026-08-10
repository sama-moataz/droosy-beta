-- roles
create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy user_roles_select_own on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

-- seed admin
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users where email = 'samamoataz73@gmail.com'
on conflict do nothing;

create or replace function public.grant_admin_for_seed_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'samamoataz73@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke execute on function public.grant_admin_for_seed_email() from public, anon, authenticated;

create trigger grant_admin_for_seed_email_trg
after insert on auth.users
for each row execute function public.grant_admin_for_seed_email();

-- admin access to applications
create policy applications_admin_select on public.teacher_applications
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy applications_admin_update on public.teacher_applications
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- admin manage teachers
create policy teachers_admin_insert on public.teachers
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

create policy teachers_admin_update on public.teachers
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant insert, update on public.teachers to authenticated;

-- storage: admins read verification docs, owners manage their own
create policy verification_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'teacher-verification' and public.has_role(auth.uid(), 'admin'));

create policy verification_owner_rw on storage.objects
  for all to authenticated
  using (bucket_id = 'teacher-verification' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'teacher-verification' and (storage.foldername(name))[1] = auth.uid()::text);