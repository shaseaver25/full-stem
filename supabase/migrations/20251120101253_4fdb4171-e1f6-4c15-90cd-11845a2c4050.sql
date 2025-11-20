-- ==========================================
-- CRITICAL FIX: Change default role from teacher to student
-- ==========================================

-- Drop and recreate the handle_new_user function with correct default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- Create profile for all users
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(
        NEW.raw_user_meta_data->>'first_name',
        ' ',
        NEW.raw_user_meta_data->>'last_name'
      ),
      NEW.email
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
  
  -- Handle student role
  IF NEW.raw_user_meta_data->>'role' = 'student' THEN
    INSERT INTO public.students (user_id, first_name, last_name, grade_level)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'grade_level', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Handle teacher role
  ELSIF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'teacher'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  
  -- DEFAULT TO STUDENT ROLE (FIXED - was defaulting to teacher)
  ELSE
    -- Create student profile for users without explicit role
    INSERT INTO public.students (user_id, first_name, last_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'Student'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Default to student role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ==========================================
-- CREATE CLASSROOM JOIN REQUESTS SYSTEM
-- ==========================================

-- Create classroom join requests table
CREATE TABLE IF NOT EXISTS public.classroom_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  message TEXT, -- optional message from student
  rejection_reason TEXT, -- optional reason if rejected
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, student_id) -- prevent duplicate requests
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_join_requests_class_status ON public.classroom_join_requests(class_id, status);
CREATE INDEX IF NOT EXISTS idx_join_requests_student_status ON public.classroom_join_requests(student_id, status);

-- Enable RLS
ALTER TABLE public.classroom_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classroom_join_requests

-- Students can create requests for themselves
CREATE POLICY "Students can create join requests"
ON public.classroom_join_requests FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.students WHERE id = student_id
  )
);

-- Students can view their own requests
CREATE POLICY "Students can view own requests"
ON public.classroom_join_requests FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.students WHERE id = student_id
  )
);

-- Students can cancel their own pending requests
CREATE POLICY "Students can cancel own pending requests"
ON public.classroom_join_requests FOR DELETE
TO authenticated
USING (
  status = 'pending' AND
  auth.uid() IN (
    SELECT user_id FROM public.students WHERE id = student_id
  )
);

-- Teachers can view requests for their classes
CREATE POLICY "Teachers can view class requests"
ON public.classroom_join_requests FOR SELECT
TO authenticated
USING (
  class_id IN (
    SELECT c.id FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);

-- Teachers can update requests for their classes (approve/reject)
CREATE POLICY "Teachers can update class requests"
ON public.classroom_join_requests FOR UPDATE
TO authenticated
USING (
  class_id IN (
    SELECT c.id FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);

-- Admins and developers can view all requests
CREATE POLICY "Admins can view all requests"
ON public.classroom_join_requests FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- ==========================================
-- UPDATE class_students table to track approval
-- ==========================================

-- Add columns to track who approved and when
ALTER TABLE public.class_students 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- ==========================================
-- CREATE FUNCTIONS FOR JOIN REQUEST WORKFLOW
-- ==========================================

-- Function to request to join a class
CREATE OR REPLACE FUNCTION public.request_to_join_class(
  _class_code TEXT,
  _student_user_id UUID,
  _message TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  request_id UUID,
  class_name TEXT,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_student_id UUID;
  v_class_id UUID;
  v_class_name TEXT;
  v_request_id UUID;
BEGIN
  -- Get student ID
  SELECT id INTO v_student_id
  FROM public.students
  WHERE user_id = _student_user_id;

  IF v_student_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Student profile not found'::TEXT;
    RETURN;
  END IF;

  -- Find class by code
  SELECT id, name INTO v_class_id, v_class_name
  FROM public.classes
  WHERE class_code = UPPER(_class_code);

  IF v_class_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'No class found with that code'::TEXT;
    RETURN;
  END IF;

  -- Check if already enrolled
  IF EXISTS (
    SELECT 1 FROM public.class_students
    WHERE class_id = v_class_id
    AND student_id = v_student_id
    AND status = 'active'
  ) THEN
    RETURN QUERY SELECT false, NULL::UUID, v_class_name, 'You are already enrolled in this class'::TEXT;
    RETURN;
  END IF;

  -- Check if request already exists
  IF EXISTS (
    SELECT 1 FROM public.classroom_join_requests
    WHERE class_id = v_class_id
    AND student_id = v_student_id
    AND status = 'pending'
  ) THEN
    RETURN QUERY SELECT false, NULL::UUID, v_class_name, 'You already have a pending request for this class'::TEXT;
    RETURN;
  END IF;

  -- Create join request
  INSERT INTO public.classroom_join_requests (class_id, student_id, message, status)
  VALUES (v_class_id, v_student_id, _message, 'pending')
  RETURNING id INTO v_request_id;

  RETURN QUERY SELECT true, v_request_id, v_class_name, NULL::TEXT;
END;
$$;

-- Function to approve a join request
CREATE OR REPLACE FUNCTION public.approve_join_request(
  _request_id UUID,
  _teacher_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request RECORD;
  v_teacher_id UUID;
BEGIN
  -- Get teacher profile ID
  SELECT id INTO v_teacher_id
  FROM public.teacher_profiles
  WHERE user_id = _teacher_user_id;

  IF v_teacher_id IS NULL THEN
    RETURN QUERY SELECT false, 'Teacher profile not found'::TEXT;
    RETURN;
  END IF;

  -- Get request details and verify teacher owns the class
  SELECT cjr.*, s.user_id as student_user_id
  INTO v_request
  FROM public.classroom_join_requests cjr
  JOIN public.classes c ON c.id = cjr.class_id
  JOIN public.students s ON s.id = cjr.student_id
  WHERE cjr.id = _request_id
  AND c.teacher_id = v_teacher_id
  AND cjr.status = 'pending';

  IF v_request IS NULL THEN
    RETURN QUERY SELECT false, 'Request not found or you do not have permission'::TEXT;
    RETURN;
  END IF;

  -- Update request status
  UPDATE public.classroom_join_requests
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = _teacher_user_id,
    updated_at = NOW()
  WHERE id = _request_id;

  -- Add student to class
  INSERT INTO public.class_students (
    class_id,
    student_id,
    status,
    approved_by,
    approved_at
  ) VALUES (
    v_request.class_id,
    v_request.student_id,
    'active',
    _teacher_user_id,
    NOW()
  )
  ON CONFLICT (class_id, student_id) 
  DO UPDATE SET 
    status = 'active',
    approved_by = _teacher_user_id,
    approved_at = NOW();

  -- Create submissions for existing assignments
  INSERT INTO public.assignment_submissions(assignment_id, user_id, status)
  SELECT a.id, v_request.student_user_id, 'draft'
  FROM public.class_assignments_new a
  WHERE a.class_id = v_request.class_id
  ON CONFLICT DO NOTHING;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

-- Function to reject a join request
CREATE OR REPLACE FUNCTION public.reject_join_request(
  _request_id UUID,
  _teacher_user_id UUID,
  _rejection_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request RECORD;
  v_teacher_id UUID;
BEGIN
  -- Get teacher profile ID
  SELECT id INTO v_teacher_id
  FROM public.teacher_profiles
  WHERE user_id = _teacher_user_id;

  IF v_teacher_id IS NULL THEN
    RETURN QUERY SELECT false, 'Teacher profile not found'::TEXT;
    RETURN;
  END IF;

  -- Get request details and verify teacher owns the class
  SELECT cjr.*
  INTO v_request
  FROM public.classroom_join_requests cjr
  JOIN public.classes c ON c.id = cjr.class_id
  WHERE cjr.id = _request_id
  AND c.teacher_id = v_teacher_id
  AND cjr.status = 'pending';

  IF v_request IS NULL THEN
    RETURN QUERY SELECT false, 'Request not found or you do not have permission'::TEXT;
    RETURN;
  END IF;

  -- Update request status
  UPDATE public.classroom_join_requests
  SET 
    status = 'rejected',
    rejection_reason = _rejection_reason,
    reviewed_at = NOW(),
    reviewed_by = _teacher_user_id,
    updated_at = NOW()
  WHERE id = _request_id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_join_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_join_requests_updated_at
BEFORE UPDATE ON public.classroom_join_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_join_requests_updated_at();