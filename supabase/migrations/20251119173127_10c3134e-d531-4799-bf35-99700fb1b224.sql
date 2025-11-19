-- Enable RLS on class_join_log table
ALTER TABLE public.class_join_log ENABLE ROW LEVEL SECURITY;

-- Students can only view their own join attempts
CREATE POLICY "Students view own join attempts"
ON public.class_join_log
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Teachers can view join attempts for their classes
CREATE POLICY "Teachers view class join attempts"
ON public.class_join_log
FOR SELECT
USING (
  class_id IN (
    SELECT c.id FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);

-- Admins can view all join attempts
CREATE POLICY "Admins view all join attempts"
ON public.class_join_log
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

-- System can insert join attempts (for enrollment logging)
CREATE POLICY "System can log join attempts"
ON public.class_join_log
FOR INSERT
WITH CHECK (true);