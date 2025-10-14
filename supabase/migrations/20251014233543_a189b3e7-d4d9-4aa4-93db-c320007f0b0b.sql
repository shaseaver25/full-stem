-- Fix infinite recursion in students table RLS policies
-- The issue is likely in policies that reference the students table within the policy itself

-- First, let's drop any problematic policies and recreate them properly
-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Students can view their own profile" ON public.students;
DROP POLICY IF EXISTS "Teachers can view their students" ON public.students;
DROP POLICY IF EXISTS "Parents can view their children" ON public.students;

-- Create non-recursive policies for students table
-- Students can view their own profile (direct match, no recursion)
CREATE POLICY "Students can view their own profile"
ON public.students
FOR SELECT
USING (user_id = auth.uid());

-- Teachers can view students in their classes
CREATE POLICY "Teachers can view their students"
ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = students.id
    AND tp.user_id = auth.uid()
  )
);

-- Parents can view their children
CREATE POLICY "Parents can view their children"
ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.student_parent_relationships spr
    JOIN public.parent_profiles pp ON pp.id = spr.parent_id
    WHERE spr.student_id = students.id
    AND pp.user_id = auth.uid()
  )
);

-- Allow students to update their own profile
CREATE POLICY "Students can update their own profile"
ON public.students
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());