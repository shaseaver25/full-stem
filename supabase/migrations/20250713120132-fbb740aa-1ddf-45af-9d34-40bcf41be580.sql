-- Create lesson_components table for modular lesson content
CREATE TABLE IF NOT EXISTS public.lesson_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id BIGINT NOT NULL,
  component_type TEXT NOT NULL CHECK (component_type IN ('video', 'instructions', 'assignment', 'activity', 'resources', 'discussion', 'reflection', 'formativeCheck', 'rubric', 'codingEditor', 'aiAssistant', 'peerReview', 'checklist', 'liveDemo')),
  content JSONB NOT NULL DEFAULT '{}',
  reading_level INTEGER,
  language_code TEXT DEFAULT 'en',
  read_aloud BOOLEAN DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (lesson_id) REFERENCES public."Lessons"("Lesson ID") ON DELETE CASCADE
);

-- Create global_settings table for app-wide configuration
CREATE TABLE IF NOT EXISTS public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default lesson view mode setting
INSERT INTO public.global_settings (setting_key, setting_value, description)
VALUES ('lesson_view_mode', 'scroll', 'Layout mode for lesson pages: scroll (vertical) or modular (tabbed/swipe)')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.lesson_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for lesson_components
CREATE POLICY "Anyone can view lesson components" 
ON public.lesson_components 
FOR SELECT 
USING (true);

CREATE POLICY "Developers can manage lesson components" 
ON public.lesson_components 
FOR ALL 
USING (is_developer(auth.uid()));

-- RLS policies for global_settings
CREATE POLICY "Anyone can view global settings" 
ON public.global_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Developers can manage global settings" 
ON public.global_settings 
FOR ALL 
USING (is_developer(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_components_lesson_id ON public.lesson_components(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_components_order ON public.lesson_components("order");
CREATE INDEX IF NOT EXISTS idx_global_settings_key ON public.global_settings(setting_key);