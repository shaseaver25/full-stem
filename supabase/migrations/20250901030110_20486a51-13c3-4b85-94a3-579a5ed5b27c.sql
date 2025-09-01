-- Create comprehensive lesson components with rich content for AI course
-- First update existing lessons with detailed content

-- Lesson 1: Introduction to Artificial Intelligence
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
)
WHERE class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22' AND title = 'Introduction to Artificial Intelligence';

-- Lesson 2: How AI Works
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
)
WHERE class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22' AND title = 'How AI Works: From Data to Decisions';

-- Lesson 3: AI Ethics
UPDATE lessons 
SET content = jsonb_build_object(
  'instructional_content', jsonb_build_object(
    'overview', 'Students grapple with real ethical dilemmas in AI, developing critical thinking skills about bias, fairness, and responsibility in automated systems.',
    'learning_objectives', ARRAY[
      'Identify potential biases in AI systems',
      'Analyze real-world examples of AI ethical issues',
      'Articulate personal stance on AI decision-making',
      'Connect AI ethics to broader concepts of fairness and justice'
    ],
    'key_concepts', ARRAY[
      'Algorithmic Bias',
      'Data Representation',
      'AI Transparency and Explainability',
      'Human Oversight vs Automation',
      'Ethical AI Development'
    ],
    'teacher_notes', 'Present real cases like biased hiring algorithms or facial recognition issues. Encourage respectful debate and help students see multiple perspectives. Connect to current events when possible.',
    'case_studies', ARRAY[
      'Amazon AI recruiting tool showed bias against women',
      'Facial recognition systems with racial accuracy gaps',
      'AI in criminal justice risk assessment tools',
      'Social media algorithm content filtering'
    ]
  ),
  'materials_needed', ARRAY[
    'Case study handouts',
    'Debate preparation materials',
    'Timer for structured discussions',
    'Whiteboard for capturing key points',
    'Reflection journals'
  ]
)
WHERE class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22' AND title = 'AI Ethics: Risks, Bias, and Responsibility';

-- Continue with remaining lessons...
UPDATE lessons 
SET content = jsonb_build_object(
  'instructional_content', jsonb_build_object(
    'overview', 'Students discover practical AI tools that can enhance their academic work while learning to use them responsibly and effectively.',
    'learning_objectives', ARRAY[
      'Identify AI tools useful for academic tasks',
      'Demonstrate proper use of AI for learning enhancement',
      'Establish personal guidelines for ethical AI use in school',
      'Evaluate when AI help is appropriate vs inappropriate'
    ],
    'key_concepts', ARRAY[
      'AI as Learning Assistant',
      'Academic Integrity with AI',
      'Proper Attribution and Transparency',
      'AI Tool Limitations',
      'Responsible Use Guidelines'
    ],
    'teacher_notes', 'Emphasize that AI should enhance learning, not replace it. Discuss school policies clearly. Have students practice with low-stakes assignments first.',
    'tool_demonstrations', ARRAY[
      'ChatGPT for brainstorming and explanation',
      'Grammarly for writing improvement',
      'Quillbot for paraphrasing practice',
      'Khan Academy AI tutor features',
      'Canva AI for presentation design'
    ]
  )
)
WHERE class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22' AND title = 'Practical Ways Students Can Use AI';

-- Add structured assignments to the database
INSERT INTO assignments (id, lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  gen_random_uuid(),
  (SELECT "Lesson ID" FROM "Lessons" WHERE "Title" = 'Introduction to Artificial Intelligence' LIMIT 1),
  'AI Reflection Journal - Week 1',
  'Write a 200-word reflection on your understanding of AI after this week''s lessons. Include: 1) Your definition of AI in your own words, 2) Three specific examples of AI you use or encounter, 3) One question you still have about AI, 4) How learning about AI might change how you use technology.',
  1,
  true,
  ARRAY['pdf', 'doc', 'docx', 'txt']
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'AI Reflection Journal - Week 1');

INSERT INTO assignments (id, lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  gen_random_uuid(),
  (SELECT "Lesson ID" FROM "Lessons" WHERE "Title" = 'AI Tools for Students: Exploration and Best Practices' LIMIT 1),
  'AI Tool Review Project',
  'Complete a comprehensive review of one AI tool: 1) Choose an approved AI tool from our class list, 2) Use it for a real school assignment or personal project, 3) Document your experience with screenshots/examples, 4) Write a 300-word review covering: effectiveness, ease of use, limitations, and whether you''d recommend it to classmates, 5) Present your findings in a 3-minute class presentation.',
  5,
  true,
  ARRAY['pdf', 'pptx', 'doc', 'docx', 'jpg', 'png', 'mp4']
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'AI Tool Review Project');

INSERT INTO assignments (id, lesson_id, title, instructions, max_files, allow_text_response, file_types_allowed)
SELECT 
  gen_random_uuid(),
  (SELECT "Lesson ID" FROM "Lessons" WHERE "Title" = 'Final Project: AI in My World' LIMIT 1),
  'Final Project: AI in My World',
  'Create a capstone project demonstrating responsible AI integration: 1) Identify a real problem in your school, community, or personal life, 2) Research how AI could help address this problem, 3) Design a solution using AI tools or concepts learned in class, 4) Create a presentation (slides, video, or interactive demo) explaining your solution, 5) Include ethical considerations and limitations, 6) Present to the class in 5-7 minutes, 7) Provide constructive feedback on 2 classmates'' projects.',
  10,
  true,
  ARRAY['pdf', 'pptx', 'doc', 'docx', 'jpg', 'png', 'mp4', 'mov', 'zip']
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'Final Project: AI in My World');

-- Create detailed rubrics for each assignment
INSERT INTO rubrics (id, assignment_id, name, description, total_points)
SELECT 
  gen_random_uuid(),
  a.id,
  'AI Reflection Journal Rubric',
  'Comprehensive rubric for evaluating weekly AI reflection journal entries',
  100
FROM assignments a 
WHERE a.title = 'AI Reflection Journal - Week 1'
AND NOT EXISTS (SELECT 1 FROM rubrics r WHERE r.assignment_id = a.id);

INSERT INTO rubric_criteria (id, rubric_id, name, description, max_points, performance_levels)
SELECT 
  gen_random_uuid(),
  r.id,
  'Understanding of AI Concepts',
  'Student demonstrates clear comprehension of AI concepts discussed in class',
  40,
  jsonb_build_array(
    jsonb_build_object('level', 'Excellent (36-40 pts)', 'description', 'Shows deep understanding with accurate definitions, clear explanations, and connections between concepts'),
    jsonb_build_object('level', 'Good (30-35 pts)', 'description', 'Shows solid understanding with mostly accurate definitions and explanations'),
    jsonb_build_object('level', 'Satisfactory (24-29 pts)', 'description', 'Shows basic understanding with some accurate information but may have minor misconceptions'),
    jsonb_build_object('level', 'Needs Improvement (0-23 pts)', 'description', 'Shows limited understanding with significant misconceptions or inaccurate information')
  )
FROM rubrics r
JOIN assignments a ON r.assignment_id = a.id
WHERE a.title = 'AI Reflection Journal - Week 1'
AND NOT EXISTS (SELECT 1 FROM rubric_criteria rc WHERE rc.rubric_id = r.id AND rc.name = 'Understanding of AI Concepts');

INSERT INTO rubric_criteria (id, rubric_id, name, description, max_points, performance_levels)
SELECT 
  gen_random_uuid(),
  r.id,
  'Personal Reflection and Insights',
  'Student provides thoughtful personal insights and connections to their own experience',
  30,
  jsonb_build_array(
    jsonb_build_object('level', 'Excellent (27-30 pts)', 'description', 'Provides deep, thoughtful insights with personal connections and ethical considerations'),
    jsonb_build_object('level', 'Good (24-26 pts)', 'description', 'Provides good insights with some personal connections'),
    jsonb_build_object('level', 'Satisfactory (18-23 pts)', 'description', 'Provides basic insights with limited personal connections'),
    jsonb_build_object('level', 'Needs Improvement (0-17 pts)', 'description', 'Provides minimal insights with little to no personal reflection')
  )
FROM rubrics r
JOIN assignments a ON r.assignment_id = a.id
WHERE a.title = 'AI Reflection Journal - Week 1'
AND NOT EXISTS (SELECT 1 FROM rubric_criteria rc WHERE rc.rubric_id = r.id AND rc.name = 'Personal Reflection and Insights');

INSERT INTO rubric_criteria (id, rubric_id, name, description, max_points, performance_levels)
SELECT 
  gen_random_uuid(),
  r.id,
  'Writing Quality and Organization',
  'Student demonstrates clear, organized writing with proper grammar and structure',
  30,
  jsonb_build_array(
    jsonb_build_object('level', 'Excellent (27-30 pts)', 'description', 'Clear, engaging writing with excellent organization, grammar, and specific examples'),
    jsonb_build_object('level', 'Good (24-26 pts)', 'description', 'Clear writing with good organization and mostly correct grammar'),
    jsonb_build_object('level', 'Satisfactory (18-23 pts)', 'description', 'Generally clear writing with adequate organization and some grammar errors'),
    jsonb_build_object('level', 'Needs Improvement (0-17 pts)', 'description', 'Unclear writing with poor organization and frequent grammar errors')
  )
FROM rubrics r
JOIN assignments a ON r.assignment_id = a.id
WHERE a.title = 'AI Reflection Journal - Week 1'
AND NOT EXISTS (SELECT 1 FROM rubric_criteria rc WHERE rc.rubric_id = r.id AND rc.name = 'Writing Quality and Organization');

-- Create resources table entries
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

INSERT INTO lesson_resources (id, lesson_id, title, resource_type, url, description, order_index)
SELECT 
  gen_random_uuid(),
  l.id,
  'AI Ethics Case Studies Collection',
  'document',
  'https://docs.google.com/document/d/1xyz/ai-ethics-cases',
  'Curated collection of real-world AI ethics cases with discussion questions',
  1
FROM lessons l
WHERE l.title = 'AI Ethics: Risks, Bias, and Responsibility' AND l.class_id = '4c8c238f-5b9d-406c-aff9-bab7112f1b22'
AND NOT EXISTS (SELECT 1 FROM lesson_resources lr WHERE lr.lesson_id = l.id AND lr.title = 'AI Ethics Case Studies Collection');

-- Create teacher support materials
INSERT INTO teacher_materials (id, class_id, title, material_type, content, order_index)
VALUES 
  (gen_random_uuid(), '4c8c238f-5b9d-406c-aff9-bab7112f1b22', 'Course Pacing Guide', 'pacing_guide', 
   jsonb_build_object(
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
       'lessons', ARRAY['AI Tools Exploration', 'Intro to AI Coding'],
       'key_activities', ARRAY['Tool Testing Session', 'Simple Chatbot Creation'],
       'assessments', ARRAY['AI Tool Review Project'],
       'homework', 'Begin brainstorming final project ideas'
     )
   ), 1),
  (gen_random_uuid(), '4c8c238f-5b9d-406c-aff9-bab7112f1b22', 'Technology Requirements Checklist', 'tech_guide',
   jsonb_build_object(
     'required_tech', ARRAY[
       'Computer or tablet per student (or shared)',
       'Reliable internet connection',
       'Web browser (Chrome, Firefox, Safari)',
       'Google accounts for students (for Teachable Machine)',
       'Projector or smart board for demonstrations'
     ],
     'recommended_accounts', ARRAY[
       'Class Gmail account for shared AI tool access',
       'Teachable Machine projects saved to class Drive',
       'YouTube access for educational videos',
       'Backup activities for tech failures'
     ],
     'troubleshooting', jsonb_build_object(
       'common_issues', ARRAY[
         'Slow internet: Download videos ahead of time',
         'Blocked websites: Check with IT department',
         'Student account issues: Have backup generic accounts',
         'Camera/microphone not working: Use pre-made examples'
       ]
     )
   ), 2);