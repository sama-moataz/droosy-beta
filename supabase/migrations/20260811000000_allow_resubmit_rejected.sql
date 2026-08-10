DROP POLICY IF EXISTS "applications_update_own_pending" ON public.teacher_applications;

CREATE POLICY "applications_update_own_pending_or_rejected" ON public.teacher_applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status IN ('pending', 'rejected'))
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
