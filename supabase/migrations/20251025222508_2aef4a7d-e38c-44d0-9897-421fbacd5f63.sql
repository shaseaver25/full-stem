-- Create lesson-files storage bucket for local file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-files', 'lesson-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for lesson-files bucket
CREATE POLICY "Teachers can upload lesson files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-files'
  AND (storage.foldername(name))[1] = ('teacher-' || auth.uid()::text)
);

CREATE POLICY "Teachers can view their own lesson files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-files'
  AND (storage.foldername(name))[1] = ('teacher-' || auth.uid()::text)
);

CREATE POLICY "Teachers can delete their own lesson files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-files'
  AND (storage.foldername(name))[1] = ('teacher-' || auth.uid()::text)
);