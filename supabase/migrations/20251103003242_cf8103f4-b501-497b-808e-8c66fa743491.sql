-- Add public read policies for conference polls (where session_title is not null)

-- Allow anyone to view conference poll components
CREATE POLICY "Public can view conference poll components"
ON public.poll_components
FOR SELECT
USING (session_title IS NOT NULL);

-- Allow anyone to view conference poll options
CREATE POLICY "Public can view conference poll options"
ON public.poll_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.poll_components pc
    WHERE pc.id = poll_options.poll_component_id
    AND pc.session_title IS NOT NULL
  )
);