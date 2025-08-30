-- CRITICAL SECURITY FIXES: Implement proper RLS policies for vulnerable tables

-- 1. FIX LESSON_COMPONENTS - Replace overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage lesson components" ON public.lesson_components;

-- Teachers can manage lesson components for their classes
CREATE POLICY "Teachers can manage lesson components for their classes" 
ON public.lesson_components 
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.classes c
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE tp.user_id = auth.uid()
    AND lesson_components.lesson_id IN (
      SELECT lesson_id FROM public.class_assignments WHERE class_id = c.id
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.classes c
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE tp.user_id = auth.uid()
    AND lesson_components.lesson_id IN (
      SELECT lesson_id FROM public.class_assignments WHERE class_id = c.id
    )
  )
);

-- Students can view lesson components for their enrolled classes
CREATE POLICY "Students can view lesson components for their classes" 
ON public.lesson_components 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.students s
    WHERE s.id = auth.uid()
    AND lesson_components.lesson_id IN (
      SELECT lesson_id FROM public.class_assignments WHERE class_id = s.class_id
    )
  )
);

-- 2. FIX GRADEBOOK_SUMMARY - Replace overly permissive policies
DROP POLICY IF EXISTS "System can manage gradebook summary" ON public.gradebook_summary;
DROP POLICY IF EXISTS "Teachers can view gradebook summary" ON public.gradebook_summary;

-- Only teachers can view gradebook summary for their own students
CREATE POLICY "Teachers can view their students gradebook summary" 
ON public.gradebook_summary 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.students s
    JOIN public.classes c ON s.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE s.id = gradebook_summary.student_id
    AND tp.user_id = auth.uid()
  )
);

-- System can insert/update gradebook summary (for automated calculations)
CREATE POLICY "System can manage gradebook summary calculations" 
ON public.gradebook_summary 
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update gradebook summary calculations" 
ON public.gradebook_summary 
FOR UPDATE
USING (true);

-- 3. FIX GRADE_CATEGORIES - Restrict access to teachers and admins
DROP POLICY IF EXISTS "Teachers can view grade categories" ON public.grade_categories;

-- Only authenticated teachers can view grade categories
CREATE POLICY "Teachers can view grade categories" 
ON public.grade_categories 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.teacher_profiles tp
    WHERE tp.user_id = auth.uid()
  )
);

-- Admins can manage grade categories
CREATE POLICY "Admins can manage grade categories" 
ON public.grade_categories 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));