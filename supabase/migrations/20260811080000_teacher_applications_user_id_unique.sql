-- Add unique constraint on public.teacher_applications(user_id)
-- This enables Supabase .upsert({ ... }, { onConflict: 'user_id' }) to work correctly
-- without throwing "there is no unique or exclusion constraint matching the ON CONFLICT specification".

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teacher_applications_user_id_key'
  ) THEN
    -- First remove any old duplicate applications keeping the latest updated application for each user
    DELETE FROM public.teacher_applications
    WHERE id IN (
      SELECT id FROM (
        SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
        FROM public.teacher_applications
      ) t WHERE t.rn > 1
    );

    -- Add unique constraint
    ALTER TABLE public.teacher_applications
      ADD CONSTRAINT teacher_applications_user_id_key UNIQUE (user_id);
  END IF;
END $$;
