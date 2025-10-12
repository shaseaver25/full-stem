-- Create class_standards table
CREATE TABLE IF NOT EXISTS public.class_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  standard_code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_class_standards_class_id ON public.class_standards(class_id);

-- Enable RLS
ALTER TABLE public.class_standards ENABLE ROW LEVEL SECURITY;

-- Teachers can manage standards for their classes
CREATE POLICY "Teachers can manage their class standards"
ON public.class_standards
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = class_standards.class_id
    AND classes.teacher_id IN (
      SELECT id FROM public.teacher_profiles
      WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = class_standards.class_id
    AND classes.teacher_id IN (
      SELECT id FROM public.teacher_profiles
      WHERE user_id = auth.uid()
    )
  )
);

-- Students can view standards for their enrolled classes
CREATE POLICY "Students can view class standards"
ON public.class_standards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.students s ON s.id = cs.student_id
    WHERE cs.class_id = class_standards.class_id
    AND s.user_id = auth.uid()
  )
);

-- Update trigger for updated_at
CREATE TRIGGER update_class_standards_updated_at
  BEFORE UPDATE ON public.class_standards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();