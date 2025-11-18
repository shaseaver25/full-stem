-- Create lesson_media table
CREATE TABLE IF NOT EXISTS public.lesson_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_media ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read lesson media
CREATE POLICY "Authenticated users can read lesson media"
ON public.lesson_media
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Teachers can manage lesson media
CREATE POLICY "Teachers can manage lesson media"
ON public.lesson_media
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.classes c ON c.id = l.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE l.id = lesson_media.lesson_id AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.classes c ON c.id = l.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE l.id = lesson_media.lesson_id AND tp.user_id = auth.uid()
  )
);

-- Add foreign key to lesson_media_notes now that lesson_media exists
ALTER TABLE public.lesson_media_notes
ADD CONSTRAINT lesson_media_notes_media_id_fkey
FOREIGN KEY (media_id) REFERENCES public.lesson_media(id) ON DELETE CASCADE;

-- Create trigger function that calls the edge function
CREATE OR REPLACE FUNCTION public.trigger_process_media_notes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the edge function using http_post
  SELECT http_post(
    url := current_setting('app.settings')::json->>'supabase_url' || '/functions/v1/process-media-notes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings')::json->>'service_role_key'
    ),
    body := jsonb_build_object(
      'media_id', NEW.id,
      'media_url', NEW.media_url,
      'lesson_id', NEW.lesson_id
    )
  ) INTO request_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger process_media_notes: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_lesson_media_insert
AFTER INSERT ON public.lesson_media
FOR EACH ROW
EXECUTE FUNCTION public.trigger_process_media_notes();