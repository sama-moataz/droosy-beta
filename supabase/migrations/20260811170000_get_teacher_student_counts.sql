-- Public marketplace pages must show real, live student counts instead of the
-- static teachers.students seed column. This function returns only aggregated
-- counts (no user_id/PII), so it is safe to expose to anon + authenticated.
create or replace function public.get_teacher_student_counts()
returns table(teacher_id text, student_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select b.teacher_id, count(distinct b.user_id)
  from public.bookings b
  group by b.teacher_id
$$;

grant execute on function public.get_teacher_student_counts() to anon, authenticated;
