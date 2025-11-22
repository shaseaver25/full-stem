-- Create pivot_help_requests table for tracking when students request help
CREATE TABLE IF NOT EXISTS pivot_help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  wrong_attempts INTEGER DEFAULT 0,
  time_on_question INTEGER, -- seconds
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID REFERENCES pivot_conversations(id) ON DELETE SET NULL,
  help_useful BOOLEAN, -- Student feedback (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pivot_help_student ON pivot_help_requests(student_id);
CREATE INDEX idx_pivot_help_assessment ON pivot_help_requests(assessment_id);
CREATE INDEX idx_pivot_help_requested_at ON pivot_help_requests(requested_at);

-- Enable Row Level Security
ALTER TABLE pivot_help_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can view their own help requests
CREATE POLICY "Students can view their own help requests"
  ON pivot_help_requests
  FOR SELECT
  USING (auth.uid() = student_id);

-- RLS Policy: Students can insert their own help requests
CREATE POLICY "Students can insert their own help requests"
  ON pivot_help_requests
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- RLS Policy: Students can update their own help requests (for feedback)
CREATE POLICY "Students can update their own help requests"
  ON pivot_help_requests
  FOR UPDATE
  USING (auth.uid() = student_id);

-- RLS Policy: Teachers can view their students' help requests
CREATE POLICY "Teachers can view their students help requests"
  ON pivot_help_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_students cs
      JOIN classes c ON c.id = cs.class_id
      WHERE cs.student_id = pivot_help_requests.student_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON TABLE pivot_help_requests IS 'Tracks when students request help from Pivot AI tutor during assessments';
COMMENT ON COLUMN pivot_help_requests.wrong_attempts IS 'Number of incorrect attempts before requesting help';
COMMENT ON COLUMN pivot_help_requests.time_on_question IS 'Time spent on question in seconds before requesting help';
COMMENT ON COLUMN pivot_help_requests.help_useful IS 'Optional student feedback on whether the help was useful';