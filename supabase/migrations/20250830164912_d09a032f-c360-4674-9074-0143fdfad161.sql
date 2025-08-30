-- Fix security vulnerability: Restrict assignment access to teachers and enrolled students only

-- Drop the overly permissive policy that allows everyone to view assignments
DROP POLICY IF EXISTS "Everyone can view assignments" ON public.assignments;

-- Create secure policies for assignments table

-- Teachers can manage assignments for lessons in their classes
CREATE POLICY "Teachers can manage assignments for their lessons" 
ON public.assignments 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN teacher_profiles tp ON c.teacher_id = tp.id
    WHERE l.id = assignments.lesson_id 
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN teacher_profiles tp ON c.teacher_id = tp.id
    WHERE l.id = assignments.lesson_id 
    AND tp.user_id = auth.uid()
  )
);

-- Students can view assignments for lessons in classes they're enrolled in
CREATE POLICY "Students can view assignments for their enrolled classes" 
ON public.assignments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN students s ON s.class_id = c.id
    WHERE l.id = assignments.lesson_id 
    AND s.id = auth.uid()
  )
);