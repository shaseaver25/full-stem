-- Add teacher_only column to lesson_components table
ALTER TABLE public.lesson_components 
ADD COLUMN IF NOT EXISTS teacher_only boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.lesson_components.teacher_only IS 'When true, this component is only visible to teachers, not students';