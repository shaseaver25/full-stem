-- Add lesson_modifications column to students table
ALTER TABLE public.students 
ADD COLUMN lesson_modifications JSONB DEFAULT '[]'::jsonb;

-- Add a comment to explain the column
COMMENT ON COLUMN public.students.lesson_modifications IS 'Array of lesson modification types selected by teachers';