-- Fix set_teacher_id_on_class_insert to allow explicit teacher_id values
-- This enables edge functions to seed demo data while maintaining security for normal users

DROP FUNCTION IF EXISTS public.set_teacher_id_on_class_insert() CASCADE;

CREATE OR REPLACE FUNCTION public.set_teacher_id_on_class_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only auto-set teacher_id if not already explicitly provided
  IF NEW.teacher_id IS NULL THEN
    -- Try to get teacher profile from current user session
    NEW.teacher_id = (
      SELECT id FROM public.teacher_profiles 
      WHERE user_id = auth.uid()
      LIMIT 1
    );
    
    -- Only raise exception if auto-setting failed
    -- This means a user without teacher profile tried to create a class
    IF NEW.teacher_id IS NULL THEN
      RAISE EXCEPTION 'User must have a teacher profile to create classes';
    END IF;
  END IF;
  
  -- If teacher_id was explicitly provided (e.g., from edge function), keep it
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS auto_set_teacher_id ON public.classes;
CREATE TRIGGER auto_set_teacher_id
  BEFORE INSERT ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_teacher_id_on_class_insert();

-- Add comment explaining the logic
COMMENT ON FUNCTION public.set_teacher_id_on_class_insert() IS 
'Auto-populates teacher_id from auth.uid() only if not explicitly provided. 
This allows edge functions with service role to explicitly set teacher_id 
while maintaining security for normal user operations.';