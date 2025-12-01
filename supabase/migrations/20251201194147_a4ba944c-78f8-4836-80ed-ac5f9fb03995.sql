-- Update RLS to allow co-teachers to manage lesson components

-- Drop old teacher policy that only checks primary teacher
DROP POLICY IF EXISTS "Teachers can manage lesson components for their classes" ON public.lesson_components;

-- New policy: teachers (including co-teachers) can fully manage components
CREATE POLICY "Teachers can manage lesson components for their classes"
ON public.lesson_components
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    WHERE l.id = lesson_components.lesson_id
      AND public.is_teacher_of_class_multi(auth.uid(), l.class_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    WHERE l.id = lesson_components.lesson_id
      AND public.is_teacher_of_class_multi(auth.uid(), l.class_id)
  )
);
