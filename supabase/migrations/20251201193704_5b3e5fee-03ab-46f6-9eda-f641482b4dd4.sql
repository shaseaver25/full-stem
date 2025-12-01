
-- Drop old teacher policies that only check primary teachers
DROP POLICY IF EXISTS "Teachers can manage lessons for their classes" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can manage their class lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can view lessons for their classes" ON public.lessons;

-- Create new policies that work for both primary teachers and co-teachers
CREATE POLICY "Teachers can view lessons for their classes"
ON public.lessons
FOR SELECT
TO authenticated
USING (
  public.is_teacher_of_class_multi(auth.uid(), class_id)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Teachers can insert lessons for their classes"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_teacher_of_class_multi(auth.uid(), class_id)
);

CREATE POLICY "Teachers can update lessons for their classes"
ON public.lessons
FOR UPDATE
TO authenticated
USING (
  public.is_teacher_of_class_multi(auth.uid(), class_id)
)
WITH CHECK (
  public.is_teacher_of_class_multi(auth.uid(), class_id)
);

CREATE POLICY "Teachers can delete lessons for their classes"
ON public.lessons
FOR DELETE
TO authenticated
USING (
  public.is_teacher_of_class_multi(auth.uid(), class_id)
);
