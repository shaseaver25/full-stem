-- Add unique constraint to survey_responses table
-- This allows upsert operations on student_id + question_id combination

ALTER TABLE public.survey_responses
ADD CONSTRAINT survey_responses_student_question_unique 
UNIQUE (student_id, question_id);