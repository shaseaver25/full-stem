-- CRITICAL SECURITY FIX: Restrict assignment access to authorized users only
-- Current policies allow ALL authenticated users to manage assignments - major security flaw

-- 1. Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Authenticated users can view assignments" ON public.assignments;

-- 2. Create secure policy for teachers to manage assignments
-- Teachers can manage assignments that are published to their classes
CREATE POLICY "Teachers can manage assignments for their classes" 
ON public.assignments 
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.published_assignments pa
    JOIN public.classes c ON pa.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE pa.class_assignment_id IN (
      SELECT ca.id 
      FROM public.class_assignments ca 
      WHERE ca.lesson_id = assignments.lesson_id
    )
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.published_assignments pa
    JOIN public.classes c ON pa.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE pa.class_assignment_id IN (
      SELECT ca.id 
      FROM public.class_assignments ca 
      WHERE ca.lesson_id = assignments.lesson_id
    )
    AND tp.user_id = auth.uid()
  )
);

-- 3. Create secure policy for students to view assignments
-- Students can only view assignments published to their classes
CREATE POLICY "Students can view assignments for their classes" 
ON public.assignments 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.published_assignments pa
    JOIN public.students s ON pa.class_id = s.class_id
    WHERE pa.class_assignment_id IN (
      SELECT ca.id 
      FROM public.class_assignments ca 
      WHERE ca.lesson_id = assignments.lesson_id
    )
    AND s.id = auth.uid()
  )
);

-- 4. Alternative policy for direct class assignment access (backup path)
-- Allow teachers to manage assignments for lessons in their class_assignments
CREATE POLICY "Teachers can manage assignments via class assignments" 
ON public.assignments 
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.class_assignments ca
    JOIN public.classes c ON ca.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE ca.lesson_id = assignments.lesson_id
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.class_assignments ca
    JOIN public.classes c ON ca.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE ca.lesson_id = assignments.lesson_id
    AND tp.user_id = auth.uid()
  )
);