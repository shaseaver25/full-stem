
-- Add RLS policy to allow students to view classes they're enrolled in
CREATE POLICY "Students can view enrolled classes"
ON classes
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT class_id 
    FROM class_students 
    WHERE student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  )
);

-- Add RLS policy to allow students to view profiles of their teachers
CREATE POLICY "Students can view teacher profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT tp.user_id
    FROM teacher_profiles tp
    JOIN classes c ON c.teacher_id = tp.id
    JOIN class_students cs ON cs.class_id = c.id
    WHERE cs.student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  )
);
