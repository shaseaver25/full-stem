-- Fix Policy Exists RLS Disabled security issue
-- Enable RLS on lesson_components table that has policies but RLS disabled

ALTER TABLE public.lesson_components ENABLE ROW LEVEL SECURITY;