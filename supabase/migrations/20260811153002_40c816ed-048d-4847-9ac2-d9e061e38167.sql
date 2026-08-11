create or replace function public.owns_teacher(_user_id uuid, _teacher_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teachers t
    where t.id = _teacher_id and t.owner_id = _user_id
  )
$$;

create or replace function public.is_student_of_owner(_owner_id uuid, _student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bookings b
    join public.teachers t on t.id = b.teacher_id
    where t.owner_id = _owner_id and b.user_id = _student_id
  )
$$;

grant execute on function public.owns_teacher(uuid, text) to authenticated;
grant execute on function public.is_student_of_owner(uuid, uuid) to authenticated;

drop policy if exists bookings_select_teacher_owner on public.bookings;
create policy bookings_select_teacher_owner
on public.bookings for select to authenticated
using (public.owns_teacher(auth.uid(), teacher_id));

drop policy if exists bookings_select_admin on public.bookings;
create policy bookings_select_admin
on public.bookings for select to authenticated
using (public.has_role(auth.uid(), 'admin'::app_role));

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'::app_role));

drop policy if exists profiles_select_own_students on public.profiles;
create policy profiles_select_own_students
on public.profiles for select to authenticated
using (public.is_student_of_owner(auth.uid(), id));