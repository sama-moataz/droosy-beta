-- 1. First, handle any existing duplicates by keeping the most recently updated teacher
-- and setting owner_id = NULL for any older duplicates belonging to the same owner.
UPDATE public.teachers
SET owner_id = NULL
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, row_number() OVER (PARTITION BY owner_id ORDER BY created_at DESC) as rn
    FROM public.teachers
    WHERE owner_id IS NOT NULL
  ) t
  WHERE t.rn > 1
);

-- 2. Create a partial unique index on teachers.owner_id
-- This ensures a user can only have one teacher record moving forward,
-- while allowing NULLs for admin-created records.
CREATE UNIQUE INDEX IF NOT EXISTS unique_teacher_owner_id ON public.teachers (owner_id) WHERE owner_id IS NOT NULL;
