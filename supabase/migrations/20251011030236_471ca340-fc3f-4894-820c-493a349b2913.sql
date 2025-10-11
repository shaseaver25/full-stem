-- Create focus_mode_settings table
CREATE TABLE IF NOT EXISTS public.focus_mode_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.focus_mode_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own focus mode settings
CREATE POLICY "Users can manage their own focus mode"
  ON public.focus_mode_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_focus_mode_settings_updated_at
  BEFORE UPDATE ON public.focus_mode_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();