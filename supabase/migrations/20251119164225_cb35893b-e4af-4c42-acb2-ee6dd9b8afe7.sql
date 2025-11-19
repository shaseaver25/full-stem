-- Add RLS policy to allow students to view classes they're enrolled in
-- This allows students to see their classes even if they're not published

CREATE POLICY "Students can view their enrolled classes"
ON classes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE cs.class_id = classes.id
      AND s.user_id = auth.uid()
      AND cs.status = 'active'
  )
);