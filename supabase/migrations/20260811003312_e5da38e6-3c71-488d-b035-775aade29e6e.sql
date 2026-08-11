-- 20260810230000_unique_teacher_owner.sql
UPDATE public.teachers
SET owner_id = NULL
WHERE id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY owner_id ORDER BY created_at DESC) as rn
    FROM public.teachers WHERE owner_id IS NOT NULL
  ) t WHERE t.rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_teacher_owner_id ON public.teachers (owner_id) WHERE owner_id IS NOT NULL;

-- 20260811000000_allow_resubmit_rejected.sql
DROP POLICY IF EXISTS "applications_update_own_pending" ON public.teacher_applications;

CREATE POLICY "applications_update_own_pending_or_rejected" ON public.teacher_applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status IN ('pending', 'rejected'))
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 20260811010000_teacher_owner_update_policy.sql
DROP POLICY IF EXISTS "teachers_owner_update" ON public.teachers;

CREATE POLICY "teachers_owner_update" ON public.teachers
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());