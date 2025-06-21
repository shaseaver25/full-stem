
-- Add columns to the Lessons table to support different reading levels and translation content
ALTER TABLE public."Lessons" 
ADD COLUMN IF NOT EXISTS "Text (Grade 3)" text,
ADD COLUMN IF NOT EXISTS "Text (Grade 5)" text,
ADD COLUMN IF NOT EXISTS "Text (Grade 8)" text,
ADD COLUMN IF NOT EXISTS "Text (High School)" text,
ADD COLUMN IF NOT EXISTS "Content" text,
ADD COLUMN IF NOT EXISTS "Translated Content" jsonb;

-- Add comment to explain the translated content structure
COMMENT ON COLUMN public."Lessons"."Translated Content" IS 'JSON object containing translated versions of content by language code, e.g., {"es": "Spanish content", "so": "Somali content"}';

-- Update user_progress table to include completion date if not exists
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS "date_completed" timestamp with time zone;

-- Add RLS policies for the Lessons table (currently has none)
ALTER TABLE public."Lessons" ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to read lessons
CREATE POLICY "Authenticated users can view lessons" 
  ON public."Lessons" 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy to allow all users (including anonymous) to read lessons for trial access
CREATE POLICY "Public can view lessons" 
  ON public."Lessons" 
  FOR SELECT 
  TO anon 
  USING (true);

-- Enable RLS for user_progress table if not already enabled
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;

-- Policy for users to view their own progress
CREATE POLICY "Users can view their own progress" 
  ON public.user_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own progress
CREATE POLICY "Users can insert their own progress" 
  ON public.user_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own progress
CREATE POLICY "Users can update their own progress" 
  ON public.user_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);
