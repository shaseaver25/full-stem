-- Allow anyone to view lesson files (PowerPoints, etc.) so they don't require Office login
CREATE POLICY "Anyone can view lesson files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'lesson-files');

-- Ensure students can view assignments for their enrolled classes
DROP POLICY IF EXISTS "Students can view assignments for their classes" ON public.class_assignments_new;

CREATE POLICY "Students can view assignments for their classes"
ON public.class_assignments_new
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.class_students cs
    WHERE cs.class_id = class_assignments_new.class_id
      AND cs.student_id IN (
        SELECT id FROM public.students WHERE user_id = auth.uid()
      )
      AND cs.status = 'active'
  )
);

-- Teachers can manage assignments for their classes
DROP POLICY IF EXISTS "Teachers can manage assignments for their classes" ON public.class_assignments_new;

CREATE POLICY "Teachers can manage assignments for their classes"
ON public.class_assignments_new
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_assignments_new.class_id
      AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_assignments_new.class_id
      AND tp.user_id = auth.uid()
  )
);