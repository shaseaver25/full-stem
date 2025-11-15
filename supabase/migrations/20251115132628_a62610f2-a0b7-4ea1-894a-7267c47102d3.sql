-- Fix RLS policy for teacher_reads_class_submissions
-- The current policy checks c.teacher_id = auth.uid() but teacher_id is the teacher_profile.id
-- We need to join through teacher_profiles to check the user_id

DROP POLICY IF EXISTS "teacher_reads_class_submissions" ON assignment_submissions;

CREATE POLICY "teacher_reads_class_submissions"
ON assignment_submissions
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM class_assignments_new a
    JOIN classes c ON c.id = a.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE a.id = assignment_submissions.assignment_id
    AND tp.user_id = auth.uid()
  )
);