-- Add both Shannon and Sonya as teachers to Richfield Excel class
INSERT INTO public.class_teachers (class_id, teacher_id, role) 
VALUES 
  ('ce17fd87-11bc-4342-a8e2-097844a755f7', '2078eea0-aaa1-46cf-b181-5031184c9868', 'primary'),
  ('ce17fd87-11bc-4342-a8e2-097844a755f7', '67130565-0103-4edf-a0b0-fb4060857f44', 'co-teacher')
ON CONFLICT (class_id, teacher_id) DO NOTHING;