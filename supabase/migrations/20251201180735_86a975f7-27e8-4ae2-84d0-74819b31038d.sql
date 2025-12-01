-- Create junction table for multiple teachers per class
CREATE TABLE IF NOT EXISTS public.class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'co-teacher', -- 'primary', 'co-teacher', etc.
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(class_id, teacher_id)
);

-- Enable RLS
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;

-- Migrate existing teacher assignments to the junction table
INSERT INTO public.class_teachers (class_id, teacher_id, role)
SELECT id, teacher_id, 'primary'
FROM public.classes
WHERE teacher_id IS NOT NULL
ON CONFLICT (class_id, teacher_id) DO NOTHING;

-- Create RLS policies for class_teachers
CREATE POLICY "Teachers can view their class assignments"
ON public.class_teachers FOR SELECT
USING (
  teacher_id IN (
    SELECT id FROM public.teacher_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage teacher assignments for their classes"
ON public.class_teachers FOR ALL
USING (
  class_id IN (
    SELECT ct.class_id 
    FROM public.class_teachers ct
    JOIN public.teacher_profiles tp ON ct.teacher_id = tp.id
    WHERE tp.user_id = auth.uid()
  )
)
WITH CHECK (
  class_id IN (
    SELECT ct.class_id 
    FROM public.class_teachers ct
    JOIN public.teacher_profiles tp ON ct.teacher_id = tp.id
    WHERE tp.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all teacher assignments"
ON public.class_teachers FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

-- Create helper function to check if user is teacher of class (including junction table)
CREATE OR REPLACE FUNCTION public.is_teacher_of_class_multi(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check primary teacher
    SELECT 1 
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = _class_id
    AND tp.user_id = _user_id
  ) OR EXISTS (
    -- Check additional teachers in junction table
    SELECT 1
    FROM class_teachers ct
    JOIN teacher_profiles tp ON tp.id = ct.teacher_id
    WHERE ct.class_id = _class_id
    AND tp.user_id = _user_id
  )
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_class_teachers_class_id ON public.class_teachers(class_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher_id ON public.class_teachers(teacher_id);

COMMENT ON TABLE public.class_teachers IS 'Junction table for multiple teachers per class';
COMMENT ON FUNCTION public.is_teacher_of_class_multi IS 'Checks if user is a teacher of a class (checks both primary and additional teachers)';