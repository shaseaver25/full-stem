
-- Create assignment_grades table
CREATE TABLE public.assignment_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  grader_user_id UUID NOT NULL,
  grade NUMERIC NOT NULL,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.assignment_grades ENABLE ROW LEVEL SECURITY;

-- Create policy for teachers to insert grades
CREATE POLICY "Teachers can insert assignment grades" 
  ON public.assignment_grades 
  FOR INSERT 
  WITH CHECK (auth.uid() = grader_user_id);

-- Create policy for teachers to view grades they created
CREATE POLICY "Teachers can view their own assignment grades" 
  ON public.assignment_grades 
  FOR SELECT 
  USING (auth.uid() = grader_user_id);

-- Create policy for teachers to update grades they created
CREATE POLICY "Teachers can update their own assignment grades" 
  ON public.assignment_grades 
  FOR UPDATE 
  USING (auth.uid() = grader_user_id);

-- Add index for better performance
CREATE INDEX idx_assignment_grades_submission_id ON public.assignment_grades(submission_id);
CREATE INDEX idx_assignment_grades_grader_user_id ON public.assignment_grades(grader_user_id);
