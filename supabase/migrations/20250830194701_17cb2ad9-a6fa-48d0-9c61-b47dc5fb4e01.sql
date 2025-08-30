-- Fix critical database security issues (safe version)

-- 1. Drop and recreate RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Create content_versions table with proper RLS if it doesn't exist
CREATE TABLE IF NOT EXISTS public.content_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  description text,
  file_url text,
  changes_summary text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on content_versions
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for content_versions table
DROP POLICY IF EXISTS "Users can view content versions they created" ON public.content_versions;
DROP POLICY IF EXISTS "Users can create content versions" ON public.content_versions;

CREATE POLICY "Users can view content versions they created" 
ON public.content_versions 
FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "Users can create content versions" 
ON public.content_versions 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- 3. Fix database function search paths for security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_developer(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(_user_id, 'developer'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Check if this is a teacher signup based on metadata  
  IF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;