-- Add missing columns for submission status tracking
ALTER TABLE public.assignment_submissions 
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('assigned','draft','submitted','graded','returned')) DEFAULT 'assigned',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS return_reason text;

-- Ensure students can update their own submissions
CREATE POLICY IF NOT EXISTS "Students can update own submissions" ON public.assignment_submissions
  FOR UPDATE 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Create storage bucket for assignment submissions if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for assignment submissions
CREATE POLICY IF NOT EXISTS "Students can upload their own files" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'assignment-submissions' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Students can view their own files" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'assignment-submissions' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Students can delete their own files" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'assignment-submissions' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Teachers can view assignment files for their classes" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'assignment-submissions' 
    AND EXISTS (
      SELECT 1 FROM public.assignment_submissions asub
      JOIN public.assignments a ON asub.assignment_id = a.id
      JOIN public.class_assignments ca ON ca.lesson_id = a.lesson_id
      JOIN public.classes c ON ca.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE tp.user_id = auth.uid()
      AND asub.user_id::text = (storage.foldername(name))[1]
      AND asub.assignment_id::text = (storage.foldername(name))[3]
    )
  );