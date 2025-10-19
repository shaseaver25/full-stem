-- Create table for lesson refinements
CREATE TABLE public.lesson_refinements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons_generated(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  refined_json JSONB NOT NULL,
  student_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_refinements ENABLE ROW LEVEL SECURITY;

-- Teachers can manage refinements for lessons they created
CREATE POLICY "Teachers can manage their own refinements"
ON public.lesson_refinements
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.lessons_generated lg
    JOIN public.teacher_profiles tp ON tp.id = lg.teacher_id
    WHERE lg.id = lesson_refinements.lesson_id
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lessons_generated lg
    JOIN public.teacher_profiles tp ON tp.id = lg.teacher_id
    WHERE lg.id = lesson_refinements.lesson_id
    AND tp.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_lesson_refinements_updated_at
BEFORE UPDATE ON public.lesson_refinements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create AI lesson history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ai_lesson_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_cost NUMERIC(10, 6),
  provider TEXT,
  model TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_lesson_history
ALTER TABLE public.ai_lesson_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view AI history
CREATE POLICY "Authenticated users can view AI history"
ON public.ai_lesson_history
FOR SELECT
TO authenticated
USING (true);

-- System can insert history records
CREATE POLICY "System can insert AI history"
ON public.ai_lesson_history
FOR INSERT
WITH CHECK (true);