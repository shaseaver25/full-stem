
-- Add class_code column to classes table
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS class_code TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_classes_class_code ON classes(class_code);

-- Create a function to generate unique class codes
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6 character alphanumeric code
    code := UPPER(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM classes WHERE class_code = code) INTO exists;
    
    -- If unique, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Add trigger to auto-generate class codes for existing and new classes
CREATE OR REPLACE FUNCTION set_class_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.class_code IS NULL THEN
    NEW.class_code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_class_code ON classes;
CREATE TRIGGER trigger_set_class_code
  BEFORE INSERT OR UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION set_class_code();

-- Update existing classes without codes
UPDATE classes 
SET class_code = generate_class_code()
WHERE class_code IS NULL;
