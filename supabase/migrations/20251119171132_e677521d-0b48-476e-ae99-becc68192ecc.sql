-- Enable RLS on lessons table if not already enabled
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Teachers can view lessons for their classes" ON public.lessons;
DROP POLICY IF EXISTS "Students can view lessons for their enrolled classes" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can manage lessons for their classes" ON public.lessons;

-- Policy: Teachers can view and manage lessons for their own classes
CREATE POLICY "Teachers can view lessons for their classes"
ON public.lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = lessons.class_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage lessons for their classes"
ON public.lessons
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = lessons.class_id
    AND tp.user_id = auth.uid()
  )
);

-- Policy: Students can view lessons for classes they're enrolled in
CREATE POLICY "Students can view lessons for their enrolled classes"
ON public.lessons
FOR SELECT
USING (
  public.is_student_enrolled_in_class(auth.uid(), class_id)
);