-- Create translation_logs table for tracking translation usage
CREATE TABLE IF NOT EXISTS translation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  target_language text NOT NULL,
  text_length integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE translation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own translation logs
CREATE POLICY "Users can view their own translation logs"
  ON translation_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert translation logs
CREATE POLICY "Authenticated users can insert translation logs"
  ON translation_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX idx_translation_logs_user_id ON translation_logs(user_id);
CREATE INDEX idx_translation_logs_created_at ON translation_logs(created_at DESC);