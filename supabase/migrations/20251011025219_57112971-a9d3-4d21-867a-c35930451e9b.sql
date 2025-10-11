-- Create TTS cache table for storing generated audio
CREATE TABLE IF NOT EXISTS tts_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  language_code text NOT NULL,
  voice_style text NOT NULL,
  audio_base64 text NOT NULL,
  audio_mime text NOT NULL DEFAULT 'audio/mp3',
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tts_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own cached TTS
CREATE POLICY "Users can view their own TTS cache"
  ON tts_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert TTS cache
CREATE POLICY "Authenticated users can insert TTS cache"
  ON tts_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own TTS cache (for last_accessed)
CREATE POLICY "Users can update their own TTS cache"
  ON tts_cache
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster cache lookups
CREATE INDEX idx_tts_cache_user_text ON tts_cache(user_id, text, language_code, voice_style);
CREATE INDEX idx_tts_cache_created_at ON tts_cache(created_at DESC);

-- Function to cleanup old cache entries (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_tts_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM tts_cache
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;