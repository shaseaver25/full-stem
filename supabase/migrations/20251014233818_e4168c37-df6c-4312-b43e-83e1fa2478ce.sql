-- Fix infinite recursion in RLS policies by using security definer functions
-- This breaks the circular dependency between students, class_students, and lesson_components

-- Create security definer function to check if a user is a teacher of a student
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(_teacher_user_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = _student_id
    AND tp.user_id = _teacher_user_id
  )
$$;

-- Drop existing students table policies that cause recursion
DROP POLICY IF EXISTS "Students can view their own profile" ON public.students;
DROP POLICY IF EXISTS "Teachers can view their students" ON public.students;
DROP POLICY IF EXISTS "Parents can view their children" ON public.students;
DROP POLICY IF EXISTS "Students can update their own profile" ON public.students;

-- Create new non-recursive policies for students table
CREATE POLICY "Students can view their own profile"
ON public.students
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Teachers can view their students"
ON public.students
FOR SELECT
USING (public.is_teacher_of_student(auth.uid(), id));

CREATE POLICY "Students can update their own profile"
ON public.students
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update lesson_components policies to use security definer function
DROP POLICY IF EXISTS "Students can view lesson components for their classes" ON public.lesson_components;

CREATE POLICY "Students can view lesson components for their classes"
ON public.lesson_components
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM lessons l
    JOIN classes c ON c.id = l.class_id
    JOIN class_students cs ON cs.class_id = c.id
    WHERE l.id = lesson_components.lesson_id
    AND cs.student_id = public.get_student_id_for_user(auth.uid())
  )
);