-- Fix remaining function search path security issues

-- 1. Fix calculate_grade_metrics function
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

-- 2. Fix calculate_letter_grade function
CREATE OR REPLACE FUNCTION public.calculate_letter_grade(percentage numeric)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF percentage >= 97 THEN RETURN 'A+';
  ELSIF percentage >= 93 THEN RETURN 'A';
  ELSIF percentage >= 90 THEN RETURN 'A-';
  ELSIF percentage >= 87 THEN RETURN 'B+';
  ELSIF percentage >= 83 THEN RETURN 'B';
  ELSIF percentage >= 80 THEN RETURN 'B-';
  ELSIF percentage >= 77 THEN RETURN 'C+';
  ELSIF percentage >= 73 THEN RETURN 'C';
  ELSIF percentage >= 70 THEN RETURN 'C-';
  ELSIF percentage >= 67 THEN RETURN 'D+';
  ELSIF percentage >= 63 THEN RETURN 'D';
  ELSIF percentage >= 60 THEN RETURN 'D-';
  ELSE RETURN 'F';
  END IF;
END;
$$;

-- 3. Fix send_grade_notification function
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

-- 4. Fix update_class_publication function
CREATE OR REPLACE FUNCTION public.update_class_publication()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = now();
    NEW.status = 'published';
  ELSIF NEW.published = false AND OLD.published = true THEN
    NEW.published_at = NULL;
    NEW.status = 'draft';
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Fix update_rubric_total_points function
CREATE OR REPLACE FUNCTION public.update_rubric_total_points()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.rubrics 
  SET total_points = (
    SELECT COALESCE(SUM(max_points), 0) 
    FROM public.rubric_criteria 
    WHERE rubric_id = COALESCE(NEW.rubric_id, OLD.rubric_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.rubric_id, OLD.rubric_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Fix create_content_version function
CREATE OR REPLACE FUNCTION public.create_content_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.title != NEW.title OR OLD.description != NEW.description OR OLD.file_url != NEW.file_url) THEN
    INSERT INTO public.content_versions (
      content_id, version_number, title, description, file_url, 
      changes_summary, created_by
    ) VALUES (
      NEW.id, NEW.version_number, NEW.title, NEW.description, NEW.file_url,
      'Content updated', NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 7. Fix has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission permission_type)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.user_role_permissions urp ON ur.role = urp.role
    WHERE ur.user_id = _user_id
      AND urp.permission = _permission
  )
$$;