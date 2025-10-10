
-- Add RLS policy to allow students to enroll themselves in classes
CREATE POLICY "Students can enroll themselves"
ON class_students
FOR INSERT
TO authenticated
WITH CHECK (
  student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  )
);

-- Add RLS policy to allow students to view their own enrollments
CREATE POLICY "Students can view their enrollments"
ON class_students
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  )
);
