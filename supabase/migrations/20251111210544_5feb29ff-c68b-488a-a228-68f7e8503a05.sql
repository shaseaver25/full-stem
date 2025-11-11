-- Create student_math_sessions table for Desmos state persistence
CREATE TABLE IF NOT EXISTS public.student_math_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  activity_id TEXT,
  calculator_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_type TEXT NOT NULL DEFAULT 'calculator',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_lesson_activity UNIQUE(user_id, lesson_id, activity_id)
);

-- Enable Row Level Security
ALTER TABLE public.student_math_sessions ENABLE ROW LEVEL SECURITY;

-- Students can view their own math sessions
CREATE POLICY "Students can view their own math sessions"
ON public.student_math_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Students can create their own math sessions
CREATE POLICY "Students can create their own math sessions"
ON public.student_math_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can update their own math sessions
CREATE POLICY "Students can update their own math sessions"
ON public.student_math_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Teachers can view math sessions for their students
CREATE POLICY "Teachers can view student math sessions"
ON public.student_math_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    JOIN students s ON s.id = cs.student_id
    WHERE s.user_id = student_math_sessions.user_id
    AND tp.user_id = auth.uid()
  )
);

-- Developers can read all sessions
CREATE POLICY "Developers can read all math sessions"
ON public.student_math_sessions
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_student_math_sessions_updated_at
BEFORE UPDATE ON public.student_math_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_student_math_sessions_user_lesson ON public.student_math_sessions(user_id, lesson_id);
CREATE INDEX idx_student_math_sessions_activity ON public.student_math_sessions(activity_id);