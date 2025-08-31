-- Create tables for self-serve demo system
CREATE TABLE IF NOT EXISTS public.demo_tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seed_version TEXT DEFAULT 'v1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '6 hours'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired'))
);

CREATE TABLE IF NOT EXISTS public.demo_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Teacher', 'District Admin', 'Other')),
  school_or_district TEXT NOT NULL,
  demo_tenant_id UUID NOT NULL REFERENCES public.demo_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.magic_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  demo_tenant_id UUID NOT NULL REFERENCES public.demo_tenants(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  consumed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for demo_tenants
CREATE POLICY "Demo tenants are publicly readable for status checks" 
ON public.demo_tenants FOR SELECT USING (true);

CREATE POLICY "System can manage demo tenants" 
ON public.demo_tenants FOR ALL USING (true);

-- RLS Policies for demo_users  
CREATE POLICY "Demo users are publicly readable" 
ON public.demo_users FOR SELECT USING (true);

CREATE POLICY "System can manage demo users" 
ON public.demo_users FOR ALL USING (true);

-- RLS Policies for magic_tokens
CREATE POLICY "Magic tokens are publicly readable for consumption" 
ON public.magic_tokens FOR SELECT USING (true);

CREATE POLICY "System can manage magic tokens" 
ON public.magic_tokens FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_tenants_expires_at ON public.demo_tenants(expires_at);
CREATE INDEX IF NOT EXISTS idx_demo_users_email ON public.demo_users(email);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_token ON public.magic_tokens(token);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_expires_at ON public.magic_tokens(expires_at);