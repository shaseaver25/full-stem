-- Allow teachers to view demo students for roster management
CREATE POLICY "Teachers can view demo students" 
ON public.students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM teacher_profiles tp 
    WHERE tp.user_id = auth.uid()
  ) 
  AND 
  EXISTS (
    SELECT 1 
    FROM classes c 
    WHERE c.id = students.class_id 
    AND (c.name ILIKE '%demo%' OR c.name ILIKE '%algebra%')
  )
);