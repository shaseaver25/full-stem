-- Add helper function to get teacher profile ID for a user
CREATE OR REPLACE FUNCTION public.get_teacher_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.teacher_profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Add helper function to check if user has a teacher profile
CREATE OR REPLACE FUNCTION public.has_teacher_profile(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teacher_profiles
    WHERE user_id = _user_id
  )
$$;