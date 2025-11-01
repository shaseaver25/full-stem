-- Make the polls available to all conference sessions by clearing the session_title
UPDATE public.poll_components 
SET session_title = NULL
WHERE component_id = '00000000-0000-0000-0000-000000000001'::uuid;