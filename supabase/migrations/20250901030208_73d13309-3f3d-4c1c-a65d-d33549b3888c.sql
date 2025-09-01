-- Create missing tables for comprehensive lesson content

-- Create lesson_resources table if it doesn't exist
CREATE TABLE IF NOT EXISTS lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  resource_type text NOT NULL, -- 'video', 'document', 'interactive_tool', 'link'
  url text,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create teacher_materials table if it doesn't exist  
CREATE TABLE IF NOT EXISTS teacher_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  material_type text NOT NULL, -- 'pacing_guide', 'tech_guide', 'activity_guide', 'assessment_rubric'
  content jsonb NOT NULL DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage resources for their lessons" ON lesson_resources
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lessons l 
    JOIN classes c ON l.class_id = c.id 
    JOIN teacher_profiles tp ON c.teacher_id = tp.id
    WHERE l.id = lesson_resources.lesson_id AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view resources for published lessons" ON lesson_resources
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lessons l 
    JOIN classes c ON l.class_id = c.id 
    WHERE l.id = lesson_resources.lesson_id AND c.published = true
  )
);

CREATE POLICY "Teachers can manage their class materials" ON teacher_materials
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM classes c 
    JOIN teacher_profiles tp ON c.teacher_id = tp.id
    WHERE c.id = teacher_materials.class_id AND tp.user_id = auth.uid()
  )
);

-- Now add the assignments properly using the correct lesson IDs
INSERT INTO assignments (id, lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  gen_random_uuid(),
  l.id,
  'AI Reflection Journal - Week 1',
  'Write a 200-word reflection on your understanding of AI after this week''s lessons. Include: 1) Your definition of AI in your own words, 2) Three specific examples of AI you use or encounter, 3) One question you still have about AI, 4) How learning about AI might change how you use technology.',
  1,
  true,
  ARRAY['pdf', 'doc', 'docx', 'txt']
FROM lessons l
WHERE l.title = 'Introduction to Artificial Intelligence' AND l.class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'AI Reflection Journal - Week 1');

INSERT INTO assignments (id, lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  gen_random_uuid(),
  l.id,
  'AI Tool Review Project',
  'Complete a comprehensive review of one AI tool: 1) Choose an approved AI tool from our class list, 2) Use it for a real school assignment or personal project, 3) Document your experience with screenshots/examples, 4) Write a 300-word review covering: effectiveness, ease of use, limitations, and whether you''d recommend it to classmates, 5) Present your findings in a 3-minute class presentation.',
  5,
  true,
  ARRAY['pdf', 'pptx', 'doc', 'docx', 'jpg', 'png', 'mp4']
FROM lessons l
WHERE l.title = 'AI Tools for Students: Exploration and Best Practices' AND l.class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'AI Tool Review Project');

INSERT INTO assignments (id, lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  gen_random_uuid(),
  l.id,
  'Final Project: AI in My World',
  'Create a capstone project demonstrating responsible AI integration: 1) Identify a real problem in your school, community, or personal life, 2) Research how AI could help address this problem, 3) Design a solution using AI tools or concepts learned in class, 4) Create a presentation (slides, video, or interactive demo) explaining your solution, 5) Include ethical considerations and limitations, 6) Present to the class in 5-7 minutes, 7) Provide constructive feedback on 2 classmates'' projects.',
  10,
  true,
  ARRAY['pdf', 'pptx', 'doc', 'docx', 'jpg', 'png', 'mp4', 'mov', 'zip']
FROM lessons l
WHERE l.title = 'Final Project: AI in My World' AND l.class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'Final Project: AI in My World');

-- Add lesson resources
INSERT INTO lesson_resources (id, lesson_id, title, resource_type, url, description, order_index)
SELECT 
  gen_random_uuid(),
  l.id,
  'What is Artificial Intelligence? - Crash Course',
  'video',
  'https://youtu.be/2ePf9rue1Ao',
  'Engaging 12-minute video explaining AI basics with great visuals and examples',
  1
FROM lessons l
WHERE l.title = 'Introduction to Artificial Intelligence' AND l.class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22'
AND NOT EXISTS (SELECT 1 FROM lesson_resources lr WHERE lr.lesson_id = l.id AND lr.title = 'What is Artificial Intelligence? - Crash Course');

INSERT INTO lesson_resources (id, lesson_id, title, resource_type, url, description, order_index)
SELECT 
  gen_random_uuid(),
  l.id,
  'Teachable Machine by Google',
  'interactive_tool',
  'https://teachablemachine.withgoogle.com/',
  'Free tool for training machine learning models with images, sounds, or poses',
  1
FROM lessons l
WHERE l.title = 'How AI Works: From Data to Decisions' AND l.class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22'
AND NOT EXISTS (SELECT 1 FROM lesson_resources lr WHERE lr.lesson_id = l.id AND lr.title = 'Teachable Machine by Google');

-- Add teacher materials
INSERT INTO teacher_materials (id, class_id, title, material_type, content, order_index)
VALUES 
  (gen_random_uuid(), '4c8c238f-5b9d-406c-aff9-bab7112f1b22', 'Course Pacing Guide', 'pacing_guide', 
   jsonb_build_object(
     'overview', 'This 3-week intensive AI course is designed to give high school students practical experience with AI tools while building ethical awareness.',
     'week_1', jsonb_build_object(
       'focus', 'AI Foundations and Recognition',
       'lessons', ARRAY['Introduction to AI', 'How AI Works'],
       'key_activities', ARRAY['AI vs Human Game', 'Teachable Machine Training'],
       'assessments', ARRAY['Reflection Journal Entry 1'],
       'homework', 'Find 3 new AI examples in daily life'
     ),
     'week_2', jsonb_build_object(
       'focus', 'Ethics and Responsible Use', 
       'lessons', ARRAY['AI Ethics', 'Practical AI for Students'],
       'key_activities', ARRAY['Ethics Debate', 'AI Tool Testing'],
       'assessments', ARRAY['Reflection Journal Entry 2'],
       'homework', 'Begin AI Tool Review selection'
     ),
     'week_3', jsonb_build_object(
       'focus', 'Hands-on Application and Creation',
       'lessons', ARRAY['AI Tools Exploration', 'Intro to AI Coding', 'Final Projects'],
       'key_activities', ARRAY['Tool Testing Session', 'Simple Chatbot Creation', 'Project Presentations'],
       'assessments', ARRAY['AI Tool Review Project', 'Final Project Presentation'],
       'homework', 'Complete and present final projects'
     )
   ), 1)
WHERE NOT EXISTS (SELECT 1 FROM teacher_materials WHERE class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22' AND title = 'Course Pacing Guide');

INSERT INTO teacher_materials (id, class_id, title, material_type, content, order_index)
VALUES 
  (gen_random_uuid(), '4c8c238f-5b9d-406c-aff9-bab7112f1b22', 'Technology Requirements & Setup', 'tech_guide',
   jsonb_build_object(
     'required_tech', ARRAY[
       'Computer or tablet per student (minimum 1 per 2 students)',
       'Reliable internet connection (minimum 10 Mbps)',
       'Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)',
       'Google accounts for students (for Teachable Machine access)',
       'Projector or smart board for demonstrations',
       'Speakers for video content'
     ],
     'recommended_accounts', ARRAY[
       'Class Gmail account for shared AI tool demonstrations',
       'Teacher accounts for: ChatGPT, Grammarly, Canva',
       'Backup offline activities for internet outages',
       'Screen recording software for creating examples'
     ],
     'ai_tools_setup', jsonb_build_object(
       'free_tools', ARRAY['Teachable Machine', 'Scratch for Educators', 'MIT App Inventor'],
       'freemium_tools', ARRAY['ChatGPT (free tier)', 'Grammarly (basic)', 'Canva (education)'],
       'considerations', ARRAY['Check school AI policy before tool selection', 'Test all tools on school network', 'Have backup activities ready']
     ),
     'troubleshooting', jsonb_build_object(
       'common_issues', ARRAY[
         'Slow internet: Pre-download videos, use offline alternatives',
         'Blocked websites: Work with IT to whitelist educational AI tools',
         'Student account issues: Create backup guest accounts',
         'Camera/microphone permissions: Use pre-made training examples'
       ],
       'backup_plans', ARRAY[
         'AI concept videos downloaded locally',
         'Printable AI vs Human sorting activities',
         'Offline ethics discussion prompts',
         'Paper-based reflection templates'
       ]
     )
   ), 2)
WHERE NOT EXISTS (SELECT 1 FROM teacher_materials WHERE class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22' AND title = 'Technology Requirements & Setup');