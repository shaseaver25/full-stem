
-- Add unique constraint on user_id column to allow upsert operations
ALTER TABLE public.teacher_profiles ADD CONSTRAINT teacher_profiles_user_id_unique UNIQUE (user_id);
