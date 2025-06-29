
-- Create tables for lessons with proper structure
CREATE TABLE public.class_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT[],
  materials TEXT[],
  instructions TEXT,
  duration INTEGER DEFAULT 60,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for lesson videos
CREATE TABLE public.lesson_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.class_lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for classroom activities
CREATE TABLE public.classroom_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 30,
  materials TEXT[],
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual activities
CREATE TABLE public.individual_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_time INTEGER DEFAULT 20,
  instructions TEXT,
  resources TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for class assignments (different from existing assignments table)
CREATE TABLE public.class_assignments_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  instructions TEXT,
  rubric TEXT,
  max_points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for class resources
CREATE TABLE public.class_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'link', 'video', 'document')),
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add published status to classes table
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS instructor TEXT,
ADD COLUMN IF NOT EXISTS schedule TEXT,
ADD COLUMN IF NOT EXISTS learning_objectives TEXT,
ADD COLUMN IF NOT EXISTS prerequisites TEXT,
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 25;

-- Enable RLS on all new tables
ALTER TABLE public.class_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_resources ENABLE ROW LEVEL SECURITY;

-- Create policies for class_lessons
CREATE POLICY "Teachers can manage their class lessons" ON public.class_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = class_lessons.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create policies for lesson_videos
CREATE POLICY "Teachers can manage their lesson videos" ON public.lesson_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.class_lessons 
      JOIN public.classes ON classes.id = class_lessons.class_id
      WHERE class_lessons.id = lesson_videos.lesson_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create policies for classroom_activities
CREATE POLICY "Teachers can manage their classroom activities" ON public.classroom_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = classroom_activities.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create policies for individual_activities
CREATE POLICY "Teachers can manage their individual activities" ON public.individual_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = individual_activities.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create policies for class_assignments_new
CREATE POLICY "Teachers can manage their class assignments" ON public.class_assignments_new
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = class_assignments_new.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create policies for class_resources
CREATE POLICY "Teachers can manage their class resources" ON public.class_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = class_resources.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_class_lessons_class_id ON public.class_lessons(class_id);
CREATE INDEX idx_lesson_videos_lesson_id ON public.lesson_videos(lesson_id);
CREATE INDEX idx_classroom_activities_class_id ON public.classroom_activities(class_id);
CREATE INDEX idx_individual_activities_class_id ON public.individual_activities(class_id);
CREATE INDEX idx_class_assignments_new_class_id ON public.class_assignments_new(class_id);
CREATE INDEX idx_class_resources_class_id ON public.class_resources(class_id);
