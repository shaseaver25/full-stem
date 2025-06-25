
-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  file_types_allowed TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'mp4', 'mov'],
  max_files INTEGER DEFAULT 5,
  allow_text_response BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (lesson_id) REFERENCES public."Lessons"("Lesson ID")
);

-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  text_response TEXT,
  file_urls TEXT[],
  file_names TEXT[],
  file_types TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE,
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, user_id)
);

-- Enable RLS on assignments table
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create policy for assignments - allow everyone to read
CREATE POLICY "Everyone can view assignments" 
  ON public.assignments 
  FOR SELECT 
  USING (true);

-- Enable RLS on assignment submissions table
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for submissions - users can only see their own
CREATE POLICY "Users can view their own submissions" 
  ON public.assignment_submissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for submissions - users can insert their own
CREATE POLICY "Users can create their own submissions" 
  ON public.assignment_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for submissions - users can update their own
CREATE POLICY "Users can update their own submissions" 
  ON public.assignment_submissions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage bucket for assignment files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignment-files',
  'assignment-files',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'video/mp4',
    'video/quicktime'
  ]
);

-- Create storage policy for assignment files - users can upload their own files
CREATE POLICY "Users can upload assignment files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignment-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for assignment files - users can view their own files
CREATE POLICY "Users can view their assignment files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignment-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert a sample assignment for lesson 1
INSERT INTO public.assignments (lesson_id, title, instructions)
VALUES (
  1,
  'Excel Basics Practice',
  '<h3>Assignment Instructions</h3><p>Complete the following tasks to demonstrate your understanding of Excel basics:</p><ul><li><strong>Task 1:</strong> Create a simple spreadsheet with at least 5 rows and 3 columns of data</li><li><strong>Task 2:</strong> Apply basic formatting (bold headers, borders, colors)</li><li><strong>Task 3:</strong> Use at least 2 basic formulas (SUM, AVERAGE, etc.)</li></ul><p>You can either:</p><ul><li>Upload your completed Excel file (.xlsx or .xls)</li><li>Take screenshots of your work and upload as images</li><li>Write a text description of what you accomplished</li></ul><p><em>Due date: Complete at your own pace</em></p>'
);
