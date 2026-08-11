-- Fix Supabase security linter warning:
-- "Signed-In Users Can Execute SECURITY DEFINER Function"
--
-- has_role() is always called as has_role(auth.uid(), <role>), meaning
-- the function only ever reads the current user's own row in user_roles.
-- The user_roles RLS policy already permits SELECT where auth.uid() = user_id,
-- so SECURITY INVOKER is sufficient and eliminates the privilege escalation risk.

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
