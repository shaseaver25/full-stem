-- Drop the foreign key constraint on lesson_id to allow flexibility
ALTER TABLE public.pivot_conversations
DROP CONSTRAINT IF EXISTS pivot_conversations_lesson_id_fkey;

-- Make lesson_id nullable
ALTER TABLE public.pivot_conversations
ALTER COLUMN lesson_id DROP NOT NULL;