-- Complete the teacher-ready AI course implementation
-- Update existing lessons with comprehensive content and add assignments properly

-- First, update lesson content with comprehensive teaching materials
UPDATE lessons 
SET content = jsonb_build_object(
  'instructional_content', jsonb_build_object(
    'overview', 'This lesson introduces students to the fascinating world of artificial intelligence, helping them recognize AI in their daily lives and understand its growing impact on society.',
    'learning_objectives', ARRAY[
      'Define artificial intelligence in simple terms',
      'Identify at least 5 examples of AI in everyday life',
      'Distinguish between narrow AI and general AI',  
      'Understand basic AI terminology (algorithms, machine learning, data)'
    ],
    'key_concepts', ARRAY[
      'Artificial Intelligence Definition',
      'AI vs Human Intelligence', 
      'Types of AI (Narrow vs General)',
      'AI in Daily Life Examples',
      'Basic AI Terminology'
    ],
    'teacher_notes', 'Start with familiar examples like Netflix recommendations, Google searches, and voice assistants. Encourage students to share their own AI experiences. Use the sorting game to make abstract concepts concrete.',
    'timing_guide', jsonb_build_object(
      'warm_up', '5 minutes - Quick poll on AI familiarity',
      'video_discussion', '15 minutes - Watch and discuss intro video',
      'brainstorm_activity', '20 minutes - AI in daily life mapping',
      'sorting_game', '15 minutes - AI vs Human classification',
      'wrap_up', '5 minutes - Key takeaways and preview'
    ),
    'differentiation', jsonb_build_object(
      'for_beginners', 'Provide concrete examples and visual aids',
      'for_advanced', 'Encourage deeper questions about AI limitations',
      'accommodations', 'Use both visual and auditory examples'
    )
  ),
  'materials_needed', ARRAY[
    'Computer/projector for video',
    'Whiteboard or flipchart paper', 
    'AI vs Human sorting cards (printable)',
    'Student notebooks',
    'Internet access for demonstrations'
  ],
  'assessment_rubric', jsonb_build_object(
    'participation', 'Active engagement in discussions and activities',
    'understanding', 'Can identify AI examples and explain basic concepts',
    'reflection', 'Thoughtful responses about AI in personal experience'
  )
),
materials = ARRAY[
  'Computer/projector for video',
  'Whiteboard or flipchart paper',
  'AI vs Human sorting cards (printable)', 
  'Student notebooks',
  'Internet access for demonstrations'
]
WHERE class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22' AND title = 'Introduction to Artificial Intelligence';

-- Update the second lesson  
UPDATE lessons
SET content = jsonb_build_object(
  'instructional_content', jsonb_build_object(
    'overview', 'Students explore the mechanics behind AI, learning how machines learn from data and make predictions through hands-on experimentation.',
    'learning_objectives', ARRAY[
      'Explain how machine learning works in simple terms',
      'Understand the role of data in training AI models',
      'Create a simple AI model using Teachable Machine',
      'Identify the difference between training and prediction phases'
    ],
    'key_concepts', ARRAY[
      'Machine Learning Basics',
      'Training Data and Algorithms',
      'Neural Networks (simplified)',
      'Pattern Recognition',
      'Prediction and Classification'
    ],
    'teacher_notes', 'Use analogies like teaching a child to recognize animals. The Teachable Machine activity is crucial - ensure all students successfully train a model. Be ready to troubleshoot technical issues.',
    'timing_guide', jsonb_build_object(
      'concept_introduction', '10 minutes - ML explanation with analogies',
      'teachable_machine_demo', '10 minutes - Teacher demonstration',
      'hands_on_activity', '25 minutes - Students create their own models',
      'sharing_results', '10 minutes - Students show their trained models',
      'reflection_writing', '5 minutes - Explain AI in your own words'
    )
  ),
  'materials_needed', ARRAY[
    'Computers/tablets with internet access',
    'Access to Teachable Machine website',
    'Sample images for training (optional)',
    'Webcams or phone cameras',
    'Reflection journals or Google Docs'
  ]
),
materials = ARRAY[
  'Computers/tablets with internet access',
  'Access to Teachable Machine website',
  'Sample images for training (optional)',
  'Webcams or phone cameras',
  'Reflection journals or Google Docs'
]
WHERE class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22' AND title = 'How AI Works: From Data to Decisions';

-- Add assignments using the legacy "Lessons" table since assignments.lesson_id is bigint
INSERT INTO assignments (lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  l."Lesson ID",
  'AI Reflection Journal - Week 1',
  'Write a 200-word reflection on your understanding of AI after this week''s lessons. Include: 1) Your definition of AI in your own words, 2) Three specific examples of AI you use or encounter, 3) One question you still have about AI, 4) How learning about AI might change how you use technology.',
  1,
  true,
  ARRAY['pdf', 'doc', 'docx', 'txt']
FROM "Lessons" l
WHERE l."Title" = 'Introduction to Artificial Intelligence'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'AI Reflection Journal - Week 1')
LIMIT 1;

INSERT INTO assignments (lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  l."Lesson ID",
  'AI Tool Review Project',  
  'Complete a comprehensive review of one AI tool: 1) Choose an approved AI tool from our class list, 2) Use it for a real school assignment or personal project, 3) Document your experience with screenshots/examples, 4) Write a 300-word review covering: effectiveness, ease of use, limitations, and whether you''d recommend it to classmates, 5) Present your findings in a 3-minute class presentation.',
  5,
  true,
  ARRAY['pdf', 'pptx', 'doc', 'docx', 'jpg', 'png', 'mp4']
FROM "Lessons" l
WHERE l."Title" = 'AI Tools for Students: Exploration and Best Practices'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'AI Tool Review Project')
LIMIT 1;

INSERT INTO assignments (lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  l."Lesson ID",
  'Final Project: AI in My World',
  'Create a capstone project demonstrating responsible AI integration: 1) Identify a real problem in your school, community, or personal life, 2) Research how AI could help address this problem, 3) Design a solution using AI tools or concepts learned in class, 4) Create a presentation (slides, video, or interactive demo) explaining your solution, 5) Include ethical considerations and limitations, 6) Present to the class in 5-7 minutes, 7) Provide constructive feedback on 2 classmates'' projects.',
  10,
  true,
  ARRAY['pdf', 'pptx', 'doc', 'docx', 'jpg', 'png', 'mp4', 'mov', 'zip']
FROM "Lessons" l
WHERE l."Title" = 'Final Project: AI in My World'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'Final Project: AI in My World')
LIMIT 1;