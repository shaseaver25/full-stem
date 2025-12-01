-- Create storage bucket for benchmark documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('benchmark-documents', 'benchmark-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for benchmark documents
CREATE POLICY "Teachers can upload benchmark documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'benchmark-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can read their benchmark documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'benchmark-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete their benchmark documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'benchmark-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);