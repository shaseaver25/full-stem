-- Enable RLS on submission_analyses
ALTER TABLE submission_analyses ENABLE ROW LEVEL SECURITY;

-- Allow teachers to view analyses for their assignments
CREATE POLICY "Teachers can view analyses for their assignments"
ON submission_analyses
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM assignment_submissions asub
    JOIN class_assignments_new ca ON ca.id = asub.assignment_id
    JOIN classes c ON c.id = ca.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE asub.id = submission_analyses.submission_id
      AND tp.user_id = auth.uid()
  )
);

-- Allow teachers to update analyses for their assignments
CREATE POLICY "Teachers can update analyses for their assignments"
ON submission_analyses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM assignment_submissions asub
    JOIN class_assignments_new ca ON ca.id = asub.assignment_id
    JOIN classes c ON c.id = ca.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE asub.id = submission_analyses.submission_id
      AND tp.user_id = auth.uid()
  )
);

-- Allow students to view their own analyses
CREATE POLICY "Students can view their own analyses"
ON submission_analyses
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM assignment_submissions asub
    WHERE asub.id = submission_analyses.submission_id
      AND asub.user_id = auth.uid()
  )
);