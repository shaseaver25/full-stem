-- Remove the foreign key constraint that's causing the issue
ALTER TABLE teacher_profiles DROP CONSTRAINT IF EXISTS teacher_profiles_user_id_fkey;

-- The user_id column should still reference auth.uid() but without the foreign key constraint
-- since we can't reference auth.users directly from the public schema