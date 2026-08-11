ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_teacher_id_fkey;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE;

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_teacher_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE;

GRANT DELETE ON public.teachers TO authenticated;

DROP POLICY IF EXISTS teachers_owner_delete ON public.teachers;
CREATE POLICY teachers_owner_delete ON public.teachers
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS teachers_admin_delete ON public.teachers;
CREATE POLICY teachers_admin_delete ON public.teachers
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));