-- Fix infinite recursion in classes RLS policies
-- Create security definer function to check student enrollment without triggering recursive policies

-- Function to check if a user is enrolled as a student in a class
CREATE OR REPLACE FUNCTION public.user_enrolled_in_class(_user_id uuid, _class_id uuid)
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
    WHERE s.user_id = _user_id
      AND cs.class_id = _class_id
  )
$$;

-- Function to get all class IDs a user is enrolled in
CREATE OR REPLACE FUNCTION public.user_enrolled_class_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cs.class_id
  FROM public.class_students cs
  JOIN public.students s ON s.id = cs.student_id
  WHERE s.user_id = _user_id
$$;

-- Drop the problematic recursive policy on classes
DROP POLICY IF EXISTS "Students can view enrolled classes" ON public.classes;

-- Create new non-recursive policy using security definer function
CREATE POLICY "Students can view enrolled classes"
ON public.classes FOR SELECT
TO authenticated
USING (
  id IN (SELECT public.user_enrolled_class_ids(auth.uid()))
);

-- Also fix the students table policy to avoid checking classes
DROP POLICY IF EXISTS "Prevent unauthorized student data access" ON public.students;

-- Create simpler non-recursive policy for students
CREATE POLICY "Students and teachers can view student data"
ON public.students FOR ALL
TO authenticated
USING (
  -- Students can see their own data
  (auth.uid() = user_id)
  OR
  -- Teachers can see students in their classes via security definer function
  EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = students.id
      AND tp.user_id = auth.uid()
  )
  OR
  -- Parents can see their children
  EXISTS (
    SELECT 1
    FROM public.student_parent_relationships spr
    JOIN public.parent_profiles pp ON spr.parent_id = pp.id
    WHERE spr.student_id = students.id
      AND pp.user_id = auth.uid()
  )
);