-- Fix infinite recursion by replacing can_view_student policy with direct policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view students they have access to" ON public.students;

-- Create separate, direct policies that don't cause recursion

-- 1. Students can view their own record
CREATE POLICY "Students can view own record"
ON public.students
FOR SELECT
TO public
USING (user_id = auth.uid());

-- 2. Teachers can view students in their classes (direct query, no function)
CREATE POLICY "Teachers can view their class students"
ON public.students
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = students.id
    AND tp.user_id = auth.uid()
  )
);

-- 3. Parents can view their children (direct query, no function)
CREATE POLICY "Parents can view their children"
ON public.students
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.student_parent_relationships spr
    JOIN public.parent_profiles pp ON pp.id = spr.parent_id
    WHERE spr.student_id = students.id
    AND pp.user_id = auth.uid()
  )
);