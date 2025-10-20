-- Drop the restrictive policy that only shows enrolled students
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.students;

-- Create a new policy allowing teachers to view all students (needed for enrollment)
CREATE POLICY "Teachers can view all students"
ON public.students
FOR SELECT
USING (has_role(auth.uid(), 'teacher'::app_role));

-- Allow teachers to create students
CREATE POLICY "Teachers can create students"
ON public.students
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- Allow teachers to delete students in their classes
CREATE POLICY "Teachers can delete students in their classes"
ON public.students
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = students.id
    AND tp.user_id = auth.uid()
  )
);