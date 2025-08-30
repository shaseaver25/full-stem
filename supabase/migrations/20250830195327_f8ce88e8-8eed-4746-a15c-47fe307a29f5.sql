-- Fix critical security issue: Restrict grade viewing to only teachers of specific students
-- Drop the overly permissive policy that allows all teachers to view all grades
DROP POLICY IF EXISTS "Teachers can view all grades" ON public.grades;

-- Create a secure policy that only allows teachers to view grades for their own students
CREATE POLICY "Teachers can view grades for their students only" 
ON public.grades 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.classes c ON s.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE s.id = grades.student_id 
    AND tp.user_id = auth.uid()
  )
);

-- Also allow teachers to view grades they personally created (backup access)
CREATE POLICY "Teachers can view grades they created" 
ON public.grades 
FOR SELECT 
USING (auth.uid() = graded_by);