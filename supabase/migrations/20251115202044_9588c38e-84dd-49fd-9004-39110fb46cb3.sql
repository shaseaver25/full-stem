-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  mime_type TEXT,
  thumbnail_url TEXT,
  uploaded_by UUID NOT NULL,
  transcription_status TEXT DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
  transcription_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create video_transcripts table
CREATE TABLE IF NOT EXISTS public.video_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',
  content TEXT NOT NULL,
  segments JSONB, -- Array of {start, end, text} for synchronized captions
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(video_id, language)
);

-- Create video_translations table
CREATE TABLE IF NOT EXISTS public.video_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES public.video_transcripts(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  segments JSONB, -- Translated segments with timing
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(transcript_id, language)
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Anyone can view videos"
  ON public.videos FOR SELECT
  USING (true);

CREATE POLICY "Teachers can upload videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Teachers can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Teachers can delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = uploaded_by);

-- RLS Policies for video_transcripts
CREATE POLICY "Anyone can view transcripts"
  ON public.video_transcripts FOR SELECT
  USING (true);

CREATE POLICY "System can insert transcripts"
  ON public.video_transcripts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update transcripts"
  ON public.video_transcripts FOR UPDATE
  USING (true);

-- RLS Policies for video_translations
CREATE POLICY "Anyone can view translations"
  ON public.video_translations FOR SELECT
  USING (true);

CREATE POLICY "System can insert translations"
  ON public.video_translations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update translations"
  ON public.video_translations FOR UPDATE
  USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_transcripts_updated_at
  BEFORE UPDATE ON public.video_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_translations_updated_at
  BEFORE UPDATE ON public.video_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos',
  'lesson-videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-videos');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-videos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'lesson-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lesson-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );