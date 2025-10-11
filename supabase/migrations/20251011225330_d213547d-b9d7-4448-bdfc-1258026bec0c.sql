-- Add missing roles to app_role enum for complete role coverage
DO $$ 
BEGIN
  -- Add 'teacher' role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'teacher') THEN
    ALTER TYPE app_role ADD VALUE 'teacher';
  END IF;
  
  -- Add 'parent' role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'parent') THEN
    ALTER TYPE app_role ADD VALUE 'parent';
  END IF;
END $$;