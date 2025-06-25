
-- Create teacher profiles table
CREATE TABLE public.teacher_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school_name text,
  grade_levels text[],
  subjects text[],
  years_experience integer,
  certification_status text DEFAULT 'pending',
  pd_hours integer DEFAULT 0,
  onboarding_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid REFERENCES public.teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  grade_level text,
  subject text,
  school_year text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  grade_level text,
  reading_level text,
  learning_style text,
  interests text[],
  iep_accommodations text[],
  language_preference text DEFAULT 'en',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create class assignments table
CREATE TABLE public.class_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  lesson_id bigint REFERENCES public."Lessons"("Lesson ID") ON DELETE CASCADE NOT NULL,
  assigned_date timestamp with time zone DEFAULT now(),
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create student progress tracking table
CREATE TABLE public.student_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  lesson_id bigint REFERENCES public."Lessons"("Lesson ID") ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0,
  time_spent integer DEFAULT 0, -- in minutes
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  needs_attention boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.lesson_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid REFERENCES public.teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id bigint REFERENCES public."Lessons"("Lesson ID") ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  suggested_improvements text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create support sessions table
CREATE TABLE public.support_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid REFERENCES public.teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  session_type text NOT NULL, -- 'live_help', 'coaching', 'training'
  status text DEFAULT 'scheduled',
  scheduled_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for teacher data
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

-- Teacher profiles policies
CREATE POLICY "Teachers can view their own profile" ON public.teacher_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile" ON public.teacher_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert their own profile" ON public.teacher_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Classes policies
CREATE POLICY "Teachers can manage their own classes" ON public.classes
  FOR ALL USING (teacher_id IN (
    SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
  ));

-- Students policies
CREATE POLICY "Teachers can manage students in their classes" ON public.students
  FOR ALL USING (class_id IN (
    SELECT c.id FROM public.classes c 
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id 
    WHERE tp.user_id = auth.uid()
  ));

-- Class assignments policies
CREATE POLICY "Teachers can manage assignments for their classes" ON public.class_assignments
  FOR ALL USING (class_id IN (
    SELECT c.id FROM public.classes c 
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id 
    WHERE tp.user_id = auth.uid()
  ));

-- Student progress policies
CREATE POLICY "Teachers can view progress for their students" ON public.student_progress
  FOR ALL USING (student_id IN (
    SELECT s.id FROM public.students s
    JOIN public.classes c ON s.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id 
    WHERE tp.user_id = auth.uid()
  ));

-- Feedback policies
CREATE POLICY "Teachers can manage their own feedback" ON public.lesson_feedback
  FOR ALL USING (teacher_id IN (
    SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
  ));

-- Support sessions policies
CREATE POLICY "Teachers can manage their own support sessions" ON public.support_sessions
  FOR ALL USING (teacher_id IN (
    SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
  ));

-- Update the handle_new_user function to support teacher roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Check if this is a teacher signup based on metadata
  IF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;
