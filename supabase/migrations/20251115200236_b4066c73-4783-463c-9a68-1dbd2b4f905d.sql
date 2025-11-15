-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Students can create discussion threads for their lessons" ON discussion_threads;
DROP POLICY IF EXISTS "Teachers can create discussion threads for their lessons" ON discussion_threads;

-- Create simpler policies that allow authenticated users to create threads
-- Security is enforced by who can VIEW the threads, not who can create them
CREATE POLICY "Authenticated users can create discussion threads"
ON discussion_threads
FOR INSERT
TO authenticated
WITH CHECK (
  -- Must set created_by to their own user ID
  created_by = auth.uid()
  AND
  -- Must specify at least one context (lesson, assignment, or class)
  (lesson_id IS NOT NULL OR assignment_id IS NOT NULL OR class_id IS NOT NULL)
);