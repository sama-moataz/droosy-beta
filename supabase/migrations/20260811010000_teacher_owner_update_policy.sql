CREATE POLICY "teachers_owner_update" ON public.teachers
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
