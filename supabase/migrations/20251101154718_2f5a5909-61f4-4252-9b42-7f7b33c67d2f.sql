-- Add remaining session blocks 4-7
INSERT INTO classes (name, description, published, teacher_id)
SELECT 
  'Applied AI Conference - Session Block 4',
  'Fourth session block (1:15–2:00pm) at the Applied AI Conference 2025',
  true,
  id
FROM teacher_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

INSERT INTO classes (name, description, published, teacher_id)
SELECT 
  'Applied AI Conference - Session Block 5',
  'Fifth session block (2:15–3:00pm) at the Applied AI Conference 2025',
  true,
  id
FROM teacher_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

INSERT INTO classes (name, description, published, teacher_id)
SELECT 
  'Applied AI Conference - Session Block 6',
  'Sixth session block (3:15–4:00pm) at the Applied AI Conference 2025',
  true,
  id
FROM teacher_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

INSERT INTO classes (name, description, published, teacher_id)
SELECT 
  'Applied AI Conference - Session Block 7',
  'Seventh session block (4:15–5:00pm) at the Applied AI Conference 2025',
  true,
  id
FROM teacher_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

-- Add Session Block 4 lessons (1:15–2:00pm)
INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'A Pragmatic Guide to AI at Scale: Lessons from applying AI to enterprise systems', 'Breakout 1 – Woulfe North', id, 1 FROM classes WHERE name = 'Applied AI Conference - Session Block 4';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Trust, But Verify: Evaluating the Evaluators of LLMs', 'Breakout 2 – Woulfe South', id, 2 FROM classes WHERE name = 'Applied AI Conference - Session Block 4';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Regulating AI in International Legal Frameworks: Challenges and Opportunities for Digital Sovereignty', 'Breakout 3 – Lyden', id, 3 FROM classes WHERE name = 'Applied AI Conference - Session Block 4';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Invisible AI: Boosting Office Productivity & Driving Public AI Literacy', 'Breakout 4 – Dining', id, 4 FROM classes WHERE name = 'Applied AI Conference - Session Block 4';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Beyond the Algorithm: Why 85% of AI Projects Fail and How to Beat the Odds', 'Breakout 5 – Scooters', id, 5 FROM classes WHERE name = 'Applied AI Conference - Session Block 4';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'AI for Impact: Fixing the Web''s 96% Accessibility Gap', 'Breakout 6 – Dance (LL07)', id, 6 FROM classes WHERE name = 'Applied AI Conference - Session Block 4';

-- Add Session Block 5 lessons (2:15–3:00pm)
INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Building optimizations for latency sensitive agents', 'Breakout 1 – Woulfe North', id, 1 FROM classes WHERE name = 'Applied AI Conference - Session Block 5';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'STOP USING AI & Start using AIE (an integrated environment)', 'Breakout 2 – Woulfe South', id, 2 FROM classes WHERE name = 'Applied AI Conference - Session Block 5';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Strategic AI Leadership: Building Student, Teacher, and Administrator Competencies', 'Breakout 3 – Lyden', id, 3 FROM classes WHERE name = 'Applied AI Conference - Session Block 5';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'LLMs as the Missing Link: From Paper Forms to Automated Flows', 'Breakout 4 – Dining', id, 4 FROM classes WHERE name = 'Applied AI Conference - Session Block 5';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'From Text to Structure: Unlocking AI''s Hidden Superpower', 'Breakout 5 – Scooters', id, 5 FROM classes WHERE name = 'Applied AI Conference - Session Block 5';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Trace AI Infra - AI Infrastructure Monitoring Tool', 'Breakout 6 – Dance (LL07)', id, 6 FROM classes WHERE name = 'Applied AI Conference - Session Block 5';

-- Add Session Block 6 lessons (3:15–4:00pm)
INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Case Study: Building a SaaS product in 48 hours by leveraging Github Copilot.', 'Breakout 1 – Woulfe North', id, 1 FROM classes WHERE name = 'Applied AI Conference - Session Block 6';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Click, Snap, Sell: How AI is Replacing Product Data Entry', 'Breakout 2 – Woulfe South', id, 2 FROM classes WHERE name = 'Applied AI Conference - Session Block 6';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Mini Workshop - Vibe Coding: Ship the Feel Before the Feature', 'Breakout 3 – Lyden', id, 3 FROM classes WHERE name = 'Applied AI Conference - Session Block 6';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Why Creatives Will Be The Next Tech Giants', 'Breakout 4 – Dining', id, 4 FROM classes WHERE name = 'Applied AI Conference - Session Block 6';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Moving from AI Experimentation to Enterprise AI Solutions', 'Breakout 6 – Dance (LL07)', id, 5 FROM classes WHERE name = 'Applied AI Conference - Session Block 6';

-- Add Session Block 7 lessons (4:15–5:00pm)
INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'The Easiest Way to Run LLMs Locally: Meet Docker Model Runner', 'Breakout 1 – Woulfe North', id, 1 FROM classes WHERE name = 'Applied AI Conference - Session Block 7';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Talk Nerdy To Me: Generative AI You''ll Actually Use', 'Breakout 2 – Woulfe South', id, 2 FROM classes WHERE name = 'Applied AI Conference - Session Block 7';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Empowering Educators with AI', 'Breakout 3 – Lyden', id, 3 FROM classes WHERE name = 'Applied AI Conference - Session Block 7';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'TurboAQ', 'Breakout 4 – Dining', id, 4 FROM classes WHERE name = 'Applied AI Conference - Session Block 7';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'AI Is Taking My Job! A Spirited Debate on the Future of Work', 'Breakout 5 – Scooters', id, 5 FROM classes WHERE name = 'Applied AI Conference - Session Block 7';