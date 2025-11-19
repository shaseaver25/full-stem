-- Fix recursive RLS on classes/class_students by using a SECURITY DEFINER helper

-- Drop the previous recursive policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename = 'classes'
      AND policyname = 'Students can view their enrolled classes'
  ) THEN
    DROP POLICY "Students can view their enrolled classes" ON public.classes;
  END IF;
END$$;

-- Helper function to check if a user is enrolled in a class without triggering RLS on class_students
CREATE OR REPLACE FUNCTION public.is_student_enrolled_in_class(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.students s ON s.id = cs.student_id
    WHERE cs.class_id = _class_id
      AND s.user_id = _user_id
      AND cs.status = 'active'
  );
$$;

-- (Optional but safer) Ensure authenticated users can execute the helper
GRANT EXECUTE ON FUNCTION public.is_student_enrolled_in_class(uuid, uuid) TO authenticated;

-- Recreate the student visibility policy using the helper to avoid recursion
CREATE POLICY "Students can view their enrolled classes"
ON public.classes
FOR SELECT
USING (public.is_student_enrolled_in_class(auth.uid(), id));
