-- Add Desmos tool configuration to lessons table
ALTER TABLE public.lessons 
ADD COLUMN desmos_enabled boolean DEFAULT false,
ADD COLUMN desmos_type text DEFAULT 'calculator';

-- Add comment for documentation
COMMENT ON COLUMN public.lessons.desmos_enabled IS 'Whether to show Desmos tool for this lesson';
COMMENT ON COLUMN public.lessons.desmos_type IS 'Type of Desmos tool: calculator or geometry';