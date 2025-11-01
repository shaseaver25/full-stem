-- Add remaining session blocks
INSERT INTO classes (name, description, published, teacher_id)
SELECT 
  'Applied AI Conference - Session Block 4',
  'Fourth session block (1:15–2:00pm) of presentations at the Applied AI Conference 2025',
  true,
  id
FROM teacher_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

INSERT INTO classes (name, description, published, teacher_id)
SELECT 
  'Applied AI Conference - Session Block 5',
  'Fifth session block (2:15–3:00pm) of presentations at the Applied AI Conference 2025',
  true,
  id
FROM teacher_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

INSERT INTO classes (name, description, published, teacher_id)
SELECT 
  'Applied AI Conference - Session Block 6',
  'Sixth session block (3:15–4:00pm) of presentations at the Applied AI Conference 2025',
  true,
  id
FROM teacher_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

INSERT INTO classes (name, description, published, teacher_id)
SELECT 
  'Applied AI Conference - Session Block 7',
  'Seventh session block (4:15–5:00pm) of presentations at the Applied AI Conference 2025',
  true,
  id
FROM teacher_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

-- Session Block 1 (9:45–10:30am)
INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Beyond the Black Box: A Practitioner''s Framework for Systematic Bias Assessment in AI Models', 'Breakout 1 – Woulfe North', id, 1 FROM classes WHERE name = 'Applied AI Conference - Session Block 1';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Lean meets AI - The Future of Flow: Humans + LLMs by Design', 'Breakout 2 – Woulfe South', id, 2 FROM classes WHERE name = 'Applied AI Conference - Session Block 1';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Larry''s Engineering Odyssey', 'Breakout 3 – Lyden', id, 3 FROM classes WHERE name = 'Applied AI Conference - Session Block 1';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Building Production‑Grade AI Agents', 'Breakout 4 – Dining', id, 4 FROM classes WHERE name = 'Applied AI Conference - Session Block 1';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Embracing AI in the Classroom (and Industry)', 'Breakout 5 – Scooters', id, 5 FROM classes WHERE name = 'Applied AI Conference - Session Block 1';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'AI in Gastroenterology: Revolutionizing Care and Documentation', 'Breakout 6 – Dance (LL07)', id, 6 FROM classes WHERE name = 'Applied AI Conference - Session Block 1';

-- Session Block 2 (10:45–11:30am)
INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'The Road to AI Autonomy: Swifty''s Journey from Assistant to Agent', 'Breakout 1 – Woulfe North', id, 1 FROM classes WHERE name = 'Applied AI Conference - Session Block 2';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Accessibility + AI: Why Keeping Humans in the Loop Matters', 'Breakout 2 – Woulfe South', id, 2 FROM classes WHERE name = 'Applied AI Conference - Session Block 2';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Rebrand, Reskill, Rise: How GenAI Is Rewiring the Future of Work', 'Breakout 3 – Lyden', id, 3 FROM classes WHERE name = 'Applied AI Conference - Session Block 2';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Integration of Earth Observation data into machine learning models for On-farm Decisions', 'Breakout 4 – Dining', id, 4 FROM classes WHERE name = 'Applied AI Conference - Session Block 2';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'AI-Assisted Tools: 4-Part Prompt Pattern & Build Heuristic', 'Breakout 5 – Scooters', id, 5 FROM classes WHERE name = 'Applied AI Conference - Session Block 2';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Agentic AI Versioning: Architecting at Scale', 'Breakout 6 – Dance (LL07)', id, 6 FROM classes WHERE name = 'Applied AI Conference - Session Block 2';

-- Session Block 3 (11:45am–12:30pm)
INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'AI in the Byline: Redefining Who Gets to Tell the Story', 'Breakout 1 – Woulfe North', id, 1 FROM classes WHERE name = 'Applied AI Conference - Session Block 3';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'The Silent Leak Costing PI Firms Millions: How AI Patches Revenue Holes You Don''t See', 'Breakout 2 – Woulfe South', id, 2 FROM classes WHERE name = 'Applied AI Conference - Session Block 3';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'AI Solution Delivery & Development', 'Breakout 3 – Lyden', id, 3 FROM classes WHERE name = 'Applied AI Conference - Session Block 3';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'Peering into the multiverse: Agent-based simulation', 'Breakout 4 – Dining', id, 4 FROM classes WHERE name = 'Applied AI Conference - Session Block 3';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'AI at the Manufacturing Test Bench', 'Breakout 5 – Scooters', id, 5 FROM classes WHERE name = 'Applied AI Conference - Session Block 3';

INSERT INTO lessons (title, description, class_id, order_index)
SELECT 'AI & the changing role of Supply Chain Plannerss', 'Breakout 6 – Dance (LL07)', id, 6 FROM classes WHERE name = 'Applied AI Conference - Session Block 3';

-- Session Block 4 (1:15–2:00pm)
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

-- Session Block 5 (2:15–3:00pm)
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

-- Session Block 6 (3:15–4:00pm)
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

-- Session Block 7 (4:15–5:00pm)
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