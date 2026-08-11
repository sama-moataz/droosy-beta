-- Ensure RLS is enabled (idempotent; teachers predates the migrations folder so
-- we cannot assume this ran anywhere else).
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Make sure the roles that need to read teachers can (RLS still applies on top
-- of this; GRANT alone does not expose rows without a matching policy).
GRANT SELECT ON public.teachers TO anon, authenticated;

-- 1. Public / student marketplace browsing: anyone (including signed-out
--    visitors) can see verified teacher listings.
DROP POLICY IF EXISTS "teachers_select_verified" ON public.teachers;
CREATE POLICY "teachers_select_verified" ON public.teachers
  FOR SELECT
  USING (verified = true);

-- 2. Teacher owners can always see their own teacher record, even if it is
--    not (yet) verified -- e.g. right after approval, before an admin
--    double-checks it, or if verification is ever revoked.
DROP POLICY IF EXISTS "teachers_select_own" ON public.teachers;
CREATE POLICY "teachers_select_own" ON public.teachers
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

-- 3. Admins can see every teacher record regardless of verification/owner.
DROP POLICY IF EXISTS "teachers_select_admin" ON public.teachers;
CREATE POLICY "teachers_select_admin" ON public.teachers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
