-- RLS policies for public.bookings so teachers and admins can view student bookings

-- Drop existing restrictive or conflicting policies if any
DROP POLICY IF EXISTS "bookings_teacher_select" ON public.bookings;
DROP POLICY IF EXISTS "bookings_admin_select" ON public.bookings;
DROP POLICY IF EXISTS "bookings_select_own" ON public.bookings;

-- 1. Students can view their own bookings
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Teachers can view bookings made for teachers they own
CREATE POLICY "bookings_teacher_select" ON public.bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers
      WHERE teachers.id = bookings.teacher_id
        AND teachers.owner_id = auth.uid()
    )
  );

-- 3. Admins can view all bookings
CREATE POLICY "bookings_admin_select" ON public.bookings
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
  );
