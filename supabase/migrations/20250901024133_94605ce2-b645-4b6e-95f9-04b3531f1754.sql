-- Fix security issues with the trigger function
DROP FUNCTION IF EXISTS set_teacher_id_on_class_insert() CASCADE;

CREATE OR REPLACE FUNCTION set_teacher_id_on_class_insert()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Recreate the trigger
CREATE TRIGGER auto_set_teacher_id
  BEFORE INSERT ON classes
  FOR EACH ROW EXECUTE FUNCTION set_teacher_id_on_class_insert();