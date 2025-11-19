-- Create RPC function for secure join-by-code flow
CREATE OR REPLACE FUNCTION public.join_class_by_code(_user_id uuid, _class_code text)
RETURNS TABLE(success boolean, class_name text, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid;
  v_class_id uuid;
  v_class_name text;
  v_profile_data record;
  v_first_name text;
  v_last_name text;
BEGIN
  -- Step 1: Get or create student profile
  SELECT id INTO v_student_id
  FROM public.students
  WHERE user_id = _user_id
  LIMIT 1;

  IF v_student_id IS NULL THEN
    -- Get profile data
    SELECT full_name, email INTO v_profile_data
    FROM public.profiles
    WHERE id = _user_id
    LIMIT 1;

    -- Parse name
    IF v_profile_data.full_name IS NOT NULL THEN
      v_first_name := split_part(v_profile_data.full_name, ' ', 1);
      v_last_name := substring(v_profile_data.full_name from position(' ' in v_profile_data.full_name) + 1);
    ELSE
      v_first_name := 'Student';
      v_last_name := '';
    END IF;

    -- Create student profile
    INSERT INTO public.students (user_id, first_name, last_name)
    VALUES (_user_id, v_first_name, v_last_name)
    RETURNING id INTO v_student_id;

    -- Ensure student role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'student'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Step 2: Find class by code (bypassing RLS)
  SELECT id, name INTO v_class_id, v_class_name
  FROM public.classes
  WHERE class_code = upper(_class_code)
  LIMIT 1;

  IF v_class_id IS NULL THEN
    RETURN QUERY SELECT false, null::text, 'No class found with that code. Please check the code and try again.'::text;
    RETURN;
  END IF;

  -- Step 3: Check if already enrolled
  IF EXISTS (
    SELECT 1 FROM public.class_students
    WHERE class_id = v_class_id
      AND student_id = v_student_id
      AND status = 'active'
  ) THEN
    RETURN QUERY SELECT false, v_class_name, ('You''re already enrolled in ' || v_class_name || '!')::text;
    RETURN;
  END IF;

  -- Step 4: Enroll student
  INSERT INTO public.class_students (class_id, student_id, status)
  VALUES (v_class_id, v_student_id, 'active')
  ON CONFLICT (class_id, student_id) 
  DO UPDATE SET status = 'active';

  -- Return success
  RETURN QUERY SELECT true, v_class_name, null::text;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.join_class_by_code(uuid, text) TO authenticated;