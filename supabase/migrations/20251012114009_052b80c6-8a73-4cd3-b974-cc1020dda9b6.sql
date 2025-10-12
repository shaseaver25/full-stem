-- Fix remaining infinite recursion in students table
-- Use security definer functions to avoid circular policy references

-- Drop all existing policies on students table
DROP POLICY IF EXISTS "student_reads_self" ON public.students;
DROP POLICY IF EXISTS "teacher_reads_roster" ON public.students;
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON public.students;
DROP POLICY IF EXISTS "Parents can view their children data" ON public.students;

-- Create security definer function to check if user can view a student
CREATE OR REPLACE FUNCTION public.can_view_student(_user_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user is the student themselves (via user_id)
  SELECT EXISTS (
    SELECT 1 FROM public.students 
    WHERE id = _student_id AND user_id = _user_id
  )
  OR
  -- Check if user is a teacher of the student
  EXISTS (
    SELECT 1 
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = _student_id
    AND tp.user_id = _user_id
  )
  OR
  -- Check if user is a parent of the student
  EXISTS (
    SELECT 1
    FROM public.student_parent_relationships spr
    JOIN public.parent_profiles pp ON pp.id = spr.parent_id
    WHERE spr.student_id = _student_id
    AND pp.user_id = _user_id
  )
$$;

-- Create security definer function to check if user can manage a student
CREATE OR REPLACE FUNCTION public.can_manage_student(_user_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only teachers can manage students in their classes
  SELECT EXISTS (
    SELECT 1 
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = _student_id
    AND tp.user_id = _user_id
  )
$$;

-- Create simple, non-recursive policies using the security definer functions
CREATE POLICY "Users can view students they have access to"
ON public.students
FOR SELECT
USING (public.can_view_student(auth.uid(), id));

CREATE POLICY "Teachers can manage students in their classes"
ON public.students
FOR ALL
USING (public.can_manage_student(auth.uid(), id));

CREATE POLICY "Students can update their own record"
ON public.students
FOR UPDATE
USING (user_id = auth.uid());