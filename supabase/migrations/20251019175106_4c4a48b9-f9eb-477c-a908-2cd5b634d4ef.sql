-- Create table for AI-generated lessons
CREATE TABLE public.lessons_generated (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  lesson_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons_generated ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own generated lessons
CREATE POLICY "Teachers can manage their own generated lessons"
ON public.lessons_generated
FOR ALL
USING (
  teacher_id IN (
    SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  teacher_id IN (
    SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_lessons_generated_updated_at
BEFORE UPDATE ON public.lessons_generated
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();