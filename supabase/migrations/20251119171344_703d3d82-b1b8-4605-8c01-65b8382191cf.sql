-- Fix RLS on class_lessons so teachers and enrolled students can see lessons

-- Ensure RLS is enabled
ALTER TABLE public.class_lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policy to avoid conflicting logic
DROP POLICY IF EXISTS "Teachers can manage their class lessons" ON public.class_lessons;
DROP POLICY IF EXISTS "Students can view lessons for their enrolled classes" ON public.class_lessons;

-- Teachers: full manage access to lessons for their classes
CREATE POLICY "Teachers can manage their class lessons"
ON public.class_lessons
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_lessons.class_id
      AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_lessons.class_id
      AND tp.user_id = auth.uid()
  )
);

-- Students: read-only access to lessons for classes they are actively enrolled in
CREATE POLICY "Students can view lessons for their enrolled classes"
ON public.class_lessons
FOR SELECT
USING (
  public.is_student_enrolled_in_class(auth.uid(), class_lessons.class_id)
);