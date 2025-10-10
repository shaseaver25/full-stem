
-- Step 1: Add 'student' to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'student';

-- Step 2: Make class_id nullable for independent student signups
ALTER TABLE students ALTER COLUMN class_id DROP NOT NULL;
