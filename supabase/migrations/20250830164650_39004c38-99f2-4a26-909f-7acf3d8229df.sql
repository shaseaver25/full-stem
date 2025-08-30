-- Fix critical RLS disabled security issues

-- Enable RLS on public tables that don't have it enabled
-- First, check and enable RLS on any tables that need it

-- Enable RLS on profiles table if it exists and isn't enabled
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for profiles if the table exists
DO $$
BEGIN
  -- Check if profiles table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Create policy for users to view and edit their own profile
    DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.profiles;
    CREATE POLICY "Users can view and edit their own profile" 
    ON public.profiles 
    FOR ALL 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;