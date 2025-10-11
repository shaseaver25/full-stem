-- Create accessibility_settings table for storing user preferences
CREATE TABLE IF NOT EXISTS accessibility_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tts_enabled boolean DEFAULT false,
  translation_enabled boolean DEFAULT false,
  high_contrast boolean DEFAULT false,
  dyslexia_font boolean DEFAULT false,
  preferred_language text DEFAULT 'en',
  voice_style text DEFAULT 'neutral',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE accessibility_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own accessibility settings
CREATE POLICY "Users can manage their accessibility settings"
  ON accessibility_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_accessibility_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_accessibility_settings_timestamp
  BEFORE UPDATE ON accessibility_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_accessibility_settings_updated_at();