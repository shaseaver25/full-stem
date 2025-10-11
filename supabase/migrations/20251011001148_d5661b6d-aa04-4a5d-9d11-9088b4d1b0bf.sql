-- Fix security definer functions missing search_path
-- This prevents search path manipulation attacks

-- Fix calculate_grade_metrics function
CREATE OR REPLACE FUNCTION public.calculate_grade_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Calculate percentage
  IF NEW.points_earned IS NOT NULL THEN
    NEW.percentage = (NEW.points_earned / NEW.points_possible) * 100;
  END IF;
  
  -- Calculate letter grade
  IF NEW.percentage IS NOT NULL THEN
    NEW.letter_grade = public.calculate_letter_grade(NEW.percentage);
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix rpc_enroll_students function
CREATE OR REPLACE FUNCTION public.rpc_enroll_students(p_class_id uuid, p_student_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.class_students(class_id, student_id)
  SELECT p_class_id, sid FROM unnest(p_student_ids) AS sid
  ON CONFLICT (class_id, student_id) DO NOTHING;
END;
$function$;

-- Fix set_teacher_id_on_class_insert function
CREATE OR REPLACE FUNCTION public.set_teacher_id_on_class_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Set the teacher_id to the teacher profile ID of the current user
  NEW.teacher_id = (
    SELECT id FROM public.teacher_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
  
  -- If no teacher profile found, prevent the insert
  IF NEW.teacher_id IS NULL THEN
    RAISE EXCEPTION 'User must have a teacher profile to create classes';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix rpc_assign_lesson_to_class function
CREATE OR REPLACE FUNCTION public.rpc_assign_lesson_to_class(
  p_class_id uuid, 
  p_lesson_id uuid, 
  p_component_ids uuid[], 
  p_due_at timestamp with time zone, 
  p_release_at timestamp with time zone DEFAULT NULL::timestamp with time zone, 
  p_options jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE 
  v_assignment_id uuid; 
BEGIN
  -- Create the assignment
  INSERT INTO public.class_assignments_new(
    class_id, lesson_id, selected_components, due_at, release_at, options
  ) VALUES (
    p_class_id, p_lesson_id, to_jsonb(p_component_ids), p_due_at, p_release_at, p_options
  ) RETURNING id INTO v_assignment_id;

  -- Auto-create submissions for enrolled students (using their user_id)
  INSERT INTO public.assignment_submissions(assignment_id, user_id, status)
  SELECT v_assignment_id, s.user_id, 'assigned'
  FROM public.class_students cs
  JOIN public.students s ON s.id = cs.student_id
  WHERE cs.class_id = p_class_id AND cs.status = 'active' AND s.user_id IS NOT NULL
  ON CONFLICT DO NOTHING;

  RETURN v_assignment_id; 
END;
$function$;

-- Fix rpc_backfill_assignments_for_student function
CREATE OR REPLACE FUNCTION public.rpc_backfill_assignments_for_student(p_class_id uuid, p_student_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  INSERT INTO public.assignment_submissions(assignment_id, user_id, status)
  SELECT a.id, s.user_id, 'assigned'
  FROM public.class_assignments_new a
  JOIN public.students s ON s.id = p_student_id
  WHERE a.class_id = p_class_id AND s.user_id IS NOT NULL
  ON CONFLICT DO NOTHING;
$function$;

-- Fix assignments RLS policy to require authentication
-- Remove overly permissive demo policy
DROP POLICY IF EXISTS "Demo users can access lesson assignments" ON public.assignments;

-- Add authenticated-only access policy
CREATE POLICY "Authenticated users can view assignments"
ON public.assignments FOR SELECT
TO authenticated
USING (
  -- Students see assignments for their enrolled classes
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.students s ON s.id = cs.student_id
    JOIN public.class_assignments_new ca ON ca.class_id = cs.class_id
    WHERE s.user_id = auth.uid()
      AND ca.lesson_id = assignments.lesson_id
  )
  OR
  -- Teachers see assignments for classes they teach
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    JOIN public.class_assignments_new ca ON ca.class_id = c.id
    WHERE tp.user_id = auth.uid()
      AND ca.lesson_id = assignments.lesson_id
  )
);