revoke execute on function public.owns_teacher(uuid, text) from public, anon;
revoke execute on function public.is_student_of_owner(uuid, uuid) from public, anon;
grant execute on function public.owns_teacher(uuid, text) to authenticated;
grant execute on function public.is_student_of_owner(uuid, uuid) to authenticated;