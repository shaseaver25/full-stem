-- Create pilot interest submissions table
CREATE TABLE IF NOT EXISTS public.pilot_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  program_interest TEXT[] NOT NULL,
  expected_start DATE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pilot_interest ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit (insert)
CREATE POLICY "Anyone can submit pilot interest"
ON public.pilot_interest
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins/super_admins/developers can view submissions
CREATE POLICY "Admins can view pilot interest submissions"
ON public.pilot_interest
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);