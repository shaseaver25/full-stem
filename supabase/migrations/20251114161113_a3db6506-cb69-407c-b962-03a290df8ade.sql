-- Update submission_analyses to reference assignment_submissions instead of student_submissions
ALTER TABLE submission_analyses 
DROP CONSTRAINT IF EXISTS submission_analyses_submission_id_fkey;

ALTER TABLE submission_analyses
ADD CONSTRAINT submission_analyses_submission_id_fkey 
FOREIGN KEY (submission_id) 
REFERENCES assignment_submissions(id) 
ON DELETE CASCADE;