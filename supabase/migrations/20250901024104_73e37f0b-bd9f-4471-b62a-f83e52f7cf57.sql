-- Fix the class creation process to automatically set teacher_id
-- Update the INSERT policy to automatically set teacher_id and remove the restrictive check

DROP POLICY IF EXISTS "Teachers can create their own classes" ON classes;

CREATE POLICY "Teachers can create their own classes" 
ON classes FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create a trigger to automatically set the teacher_id on insert
CREATE OR REPLACE FUNCTION set_teacher_id_on_class_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the teacher_id to the teacher profile ID of the current user
  NEW.teacher_id = (
    SELECT id FROM teacher_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
  
  -- If no teacher profile found, prevent the insert
  IF NEW.teacher_id IS NULL THEN
    RAISE EXCEPTION 'User must have a teacher profile to create classes';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS auto_set_teacher_id ON classes;
CREATE TRIGGER auto_set_teacher_id
  BEFORE INSERT ON classes
  FOR EACH ROW EXECUTE FUNCTION set_teacher_id_on_class_insert();