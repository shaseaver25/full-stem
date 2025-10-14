-- Drop old gradebook tables that are being replaced
DROP TABLE IF EXISTS public.gradebook_summary CASCADE;
DROP TABLE IF EXISTS public.grade_categories CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;

-- Drop old rubric grading tables if they exist
DROP TABLE IF EXISTS public.rubric_grades CASCADE;
DROP TABLE IF EXISTS public.rubric_criteria CASCADE;
DROP TABLE IF EXISTS public.rubrics CASCADE;