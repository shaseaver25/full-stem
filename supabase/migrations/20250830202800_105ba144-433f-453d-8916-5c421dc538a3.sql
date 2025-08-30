-- CRITICAL SECURITY FIX: Force RLS on all sensitive tables to prevent data theft
-- This addresses the "User Email Addresses Could Be Stolen by Hackers" vulnerability

-- Force RLS on profiles table - this prevents even privileged roles from bypassing RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Also force RLS on other sensitive tables identified by security scan
ALTER TABLE public.parent_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.students FORCE ROW LEVEL SECURITY; 
ALTER TABLE public.teacher_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.parent_teacher_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.grades FORCE ROW LEVEL SECURITY;
ALTER TABLE public.gradebook_summary FORCE ROW LEVEL SECURITY;

-- Ensure no anonymous access is possible by revoking public permissions
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.parent_profiles FROM public;
REVOKE ALL ON public.students FROM public;
REVOKE ALL ON public.teacher_profiles FROM public;
REVOKE ALL ON public.direct_messages FROM public;
REVOKE ALL ON public.parent_teacher_messages FROM public;
REVOKE ALL ON public.grades FROM public;
REVOKE ALL ON public.gradebook_summary FROM public;

-- Grant only authenticated access (this is handled through RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_teacher_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gradebook_summary TO authenticated;