-- Clean up orphaned assignment_submissions and fix foreign key

-- Step 1: Delete orphaned submissions that don't have a matching class_assignment_new
DELETE FROM public.assignment_submissions
WHERE assignment_id NOT IN (SELECT id FROM public.class_assignments_new);

-- Step 2: Drop the old foreign key constraint
ALTER TABLE public.assignment_submissions 
  DROP CONSTRAINT IF EXISTS assignment_submissions_assignment_id_fkey;

-- Step 3: Add the correct foreign key constraint to class_assignments_new
ALTER TABLE public.assignment_submissions 
  ADD CONSTRAINT assignment_submissions_assignment_id_fkey 
  FOREIGN KEY (assignment_id) 
  REFERENCES public.class_assignments_new(id) 
  ON DELETE CASCADE;