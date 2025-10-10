
-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      CONCAT(
        NEW.raw_user_meta_data->>'first_name',
        ' ',
        NEW.raw_user_meta_data->>'last_name'
      ),
      ''
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
  
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
  END IF;
  
  IF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'teacher'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Backfill existing user
INSERT INTO students (user_id, first_name, last_name, grade_level)
SELECT 
  id,
  COALESCE((raw_user_meta_data->>'first_name')::text, ''),
  COALESCE((raw_user_meta_data->>'last_name')::text, ''),
  COALESCE((raw_user_meta_data->>'grade_level')::text, '')
FROM auth.users
WHERE id = 'e96beaf5-9360-4224-ba27-1ff663157ec2'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('e96beaf5-9360-4224-ba27-1ff663157ec2', 'student'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
