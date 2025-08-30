-- Create storage bucket for TTS cache
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tts-cache', 'tts-cache', false);

-- Create RLS policies for TTS cache bucket
-- Only allow server-side access (service role only)
CREATE POLICY "Service role can manage TTS cache" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'tts-cache' AND auth.jwt()::json->>'role' = 'service_role');