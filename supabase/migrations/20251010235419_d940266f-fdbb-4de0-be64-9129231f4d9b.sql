-- Add ai_feedback column to assignment_submissions for storing AI-generated learning tips
ALTER TABLE assignment_submissions 
ADD COLUMN IF NOT EXISTS ai_feedback TEXT;

-- Add index for faster querying of submissions with AI feedback
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_ai_feedback 
ON assignment_submissions(user_id) 
WHERE ai_feedback IS NOT NULL;

COMMENT ON COLUMN assignment_submissions.ai_feedback IS 'AI-generated personalized learning tips and feedback for the student';