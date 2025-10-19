-- ==========================================
-- CRITICAL SECURITY FIXES
-- Addressing 3 critical vulnerabilities
-- ==========================================

-- ==========================================
-- FIX 1: Audit Logs - Restrict INSERT to own records
-- ==========================================
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert their own audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (actor_user_id = auth.uid());

-- ==========================================
-- FIX 2: Create security definer function for teacher class access
-- ==========================================
CREATE OR REPLACE FUNCTION public.is_teacher_of_class(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = _class_id
    AND tp.user_id = _user_id
  )
$$;

-- ==========================================
-- FIX 3: Lessons - Restrict to enrolled students and teachers
-- ==========================================
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;

CREATE POLICY "Students can view lessons in enrolled classes"
ON public.lessons FOR SELECT
TO authenticated
USING (
  -- Students can see lessons in classes they're enrolled in
  EXISTS (
    SELECT 1 FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE cs.class_id = lessons.class_id
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
  )
  -- Teachers can see lessons in their classes
  OR is_teacher_of_class(auth.uid(), lessons.class_id)
  -- Admins, super admins, and developers can see all
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'developer'::app_role)
);

-- ==========================================
-- Update related policies to use is_teacher_of_class()
-- ==========================================

-- Update classes policies
DROP POLICY IF EXISTS "Teachers can manage their class lessons" ON public.lessons;
CREATE POLICY "Teachers can manage their class lessons"
ON public.lessons FOR ALL
TO authenticated
USING (is_teacher_of_class(auth.uid(), class_id))
WITH CHECK (is_teacher_of_class(auth.uid(), class_id));

-- Update classroom_activities policy
DROP POLICY IF EXISTS "Teachers can manage their classroom activities" ON public.classroom_activities;
CREATE POLICY "Teachers can manage their classroom activities"
ON public.classroom_activities FOR ALL
TO authenticated
USING (is_teacher_of_class(auth.uid(), class_id))
WITH CHECK (is_teacher_of_class(auth.uid(), class_id));

-- Update class_messages policy
DROP POLICY IF EXISTS "Teachers can manage messages for their classes" ON public.class_messages;
CREATE POLICY "Teachers can manage messages for their classes"
ON public.class_messages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teacher_profiles tp
    WHERE tp.id = class_messages.teacher_id
    AND tp.user_id = auth.uid()
  )
  OR is_teacher_of_class(auth.uid(), class_id)
);

COMMENT ON FUNCTION public.is_teacher_of_class IS 'Security definer function to check if user is teacher of a class. Prevents RLS recursion and ensures consistent teacher access checks.';