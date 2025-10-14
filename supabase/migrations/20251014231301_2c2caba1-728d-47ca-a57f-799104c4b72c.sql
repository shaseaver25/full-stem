-- Create security definer function to get student_id from user_id without triggering RLS
CREATE OR REPLACE FUNCTION public.get_student_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.students
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Drop problematic policies on class_students that cause recursion
DROP POLICY IF EXISTS "Students can view their enrollments" ON public.class_students;
DROP POLICY IF EXISTS "Students can view their own enrollment" ON public.class_students;
DROP POLICY IF EXISTS "Students can enroll themselves" ON public.class_students;

-- Create new policies using the security definer function to avoid recursion
CREATE POLICY "Students can view their enrollments"
ON public.class_students
FOR SELECT
TO public
USING (student_id = public.get_student_id_for_user(auth.uid()));

CREATE POLICY "Students can insert their enrollments"
ON public.class_students
FOR INSERT
TO public
WITH CHECK (student_id = public.get_student_id_for_user(auth.uid()));

CREATE POLICY "Students can update their enrollments"
ON public.class_students
FOR UPDATE
TO public
USING (student_id = public.get_student_id_for_user(auth.uid()));

CREATE POLICY "Students can delete their enrollments"
ON public.class_students
FOR DELETE
TO public
USING (student_id = public.get_student_id_for_user(auth.uid()));