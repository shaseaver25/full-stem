-- Add session_title column to poll_components to link polls to specific conference sessions
ALTER TABLE public.poll_components ADD COLUMN IF NOT EXISTS session_title TEXT;

-- Update existing polls to be associated with the "Saving Lives" session
UPDATE public.poll_components 
SET session_title = 'Saving Lives and Millions: AI Transforms Avalanche Forecasting'
WHERE component_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_poll_components_session_title ON public.poll_components(session_title);