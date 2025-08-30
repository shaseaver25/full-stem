-- Fix missing RLS policies and create proper user role system

-- First, let's check if we have the user_roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');

-- Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT has_role(_user_id, 'admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.is_teacher(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT has_role(_user_id, 'teacher'::public.app_role)
$$;

-- Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Add RLS policies for grade_categories table
CREATE POLICY "Teachers can manage grade categories" 
ON public.grade_categories 
FOR ALL 
USING (public.is_teacher(auth.uid()) OR public.is_admin(auth.uid()));

-- Update existing function to have proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Check if this is a teacher signup based on metadata
  IF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id)
    VALUES (NEW.id);
    
    -- Assign teacher role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'teacher'::public.app_role);
  ELSE
    -- Default to student role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student'::public.app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix function search paths for other functions
CREATE OR REPLACE FUNCTION public.calculate_grade_metrics()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.send_grade_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_user_id UUID;
  assignment_title TEXT;
  grade_value NUMERIC;
BEGIN
  -- Get student user ID and assignment details
  SELECT 
    sub.user_id,
    a.title,
    NEW.grade
  INTO 
    student_user_id,
    assignment_title,
    grade_value
  FROM public.assignment_submissions sub
  JOIN public.assignments a ON sub.assignment_id = a.id
  WHERE sub.id = NEW.submission_id;

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    metadata
  ) VALUES (
    student_user_id,
    'Assignment Graded',
    'Your assignment "' || assignment_title || '" has been graded. You received a score of ' || grade_value || '.',
    'grade',
    jsonb_build_object(
      'assignment_title', assignment_title,
      'grade', grade_value,
      'submission_id', NEW.submission_id,
      'assignment_id', (SELECT assignment_id FROM public.assignment_submissions WHERE id = NEW.submission_id)
    )
  );

  RETURN NEW;
END;
$$;