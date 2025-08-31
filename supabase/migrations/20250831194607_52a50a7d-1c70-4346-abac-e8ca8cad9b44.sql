-- Create missing tables for demo system if they don't exist

-- Magic tokens table for demo access
CREATE TABLE IF NOT EXISTS public.magic_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  demo_tenant_id UUID REFERENCES public.demo_tenants(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  consumed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.magic_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for magic tokens
CREATE POLICY "Magic tokens are publicly readable for consumption" 
ON public.magic_tokens 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage magic tokens" 
ON public.magic_tokens 
FOR ALL 
USING (true);