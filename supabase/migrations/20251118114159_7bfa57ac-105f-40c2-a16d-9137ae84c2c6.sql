-- Create lesson_media_notes table
CREATE TABLE public.lesson_media_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid,
  transcript text,
  summary_teacher text,
  summary_student text,
  themes jsonb,
  vocab_list jsonb,
  questions jsonb,
  translations jsonb,
  recommended_next jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_media_notes ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own notes
CREATE POLICY "Authenticated users can manage lesson media notes"
ON public.lesson_media_notes
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Developers can read all notes
CREATE POLICY "Developers can read lesson media notes"
ON public.lesson_media_notes
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_lesson_media_notes_updated_at
  BEFORE UPDATE ON public.lesson_media_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();