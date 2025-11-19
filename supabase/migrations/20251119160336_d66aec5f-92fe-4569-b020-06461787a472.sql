-- Add missing fields to classes table for class code management
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS code_usage_limit INTEGER,
ADD COLUMN IF NOT EXISTS code_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS allow_qr_join BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_code_join BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS code_last_regenerated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to generate unique class codes
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character code excluding confusing characters (0, O, 1, I, L)
    code := UPPER(substring(md5(random()::text) from 1 for 8));
    code := translate(code, '01IOL', '23456');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM classes WHERE class_code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing classes to have class codes if they don't
UPDATE classes 
SET class_code = generate_class_code() 
WHERE class_code IS NULL;

-- Make class_code required and unique
ALTER TABLE classes 
ALTER COLUMN class_code SET NOT NULL,
ADD CONSTRAINT classes_class_code_unique UNIQUE (class_code);

-- Create class_join_log table for tracking enrollment attempts
CREATE TABLE IF NOT EXISTS class_join_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID,
  join_method VARCHAR(20),
  join_code VARCHAR(8),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  device_info TEXT,
  success BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_class_join_log_class ON class_join_log(class_id);
CREATE INDEX IF NOT EXISTS idx_class_join_log_student ON class_join_log(student_id);
CREATE INDEX IF NOT EXISTS idx_class_join_log_joined_at ON class_join_log(joined_at);

-- Update the set_class_code trigger to use new function
CREATE OR REPLACE FUNCTION set_class_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.class_code IS NULL THEN
    NEW.class_code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;