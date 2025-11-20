-- Pivot AI Learning Assistant - Foundation Tables

-- Main conversations table
CREATE TABLE pivot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  component_id UUID,
  component_type TEXT,
  question_id UUID,
  question_text TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  was_successful BOOLEAN,
  total_exchanges INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages
CREATE TABLE pivot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES pivot_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('student', 'pivot')),
  message_text TEXT NOT NULL,
  message_type TEXT,
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hints offered/used
CREATE TABLE pivot_hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES pivot_conversations(id) ON DELETE CASCADE,
  hint_text TEXT NOT NULL,
  was_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pivot_conversations_student ON pivot_conversations(student_id);
CREATE INDEX idx_pivot_conversations_lesson ON pivot_conversations(lesson_id);
CREATE INDEX idx_pivot_messages_conversation ON pivot_messages(conversation_id);
CREATE INDEX idx_pivot_messages_sequence ON pivot_messages(conversation_id, sequence_number);

-- Enable RLS
ALTER TABLE pivot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pivot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pivot_hints ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students manage own conversations"
ON pivot_conversations FOR ALL
USING (student_id = auth.uid());

CREATE POLICY "Students manage own messages"
ON pivot_messages FOR ALL
USING (
  conversation_id IN (
    SELECT id FROM pivot_conversations WHERE student_id = auth.uid()
  )
);

CREATE POLICY "Students manage own hints"
ON pivot_hints FOR ALL
USING (
  conversation_id IN (
    SELECT id FROM pivot_conversations WHERE student_id = auth.uid()
  )
);

-- Teachers can view conversations of their students
CREATE POLICY "Teachers view class conversations"
ON pivot_conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    JOIN students s ON s.id = cs.student_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE s.user_id = pivot_conversations.student_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers view class messages"
ON pivot_messages FOR SELECT
USING (
  conversation_id IN (
    SELECT pc.id FROM pivot_conversations pc
    JOIN students s ON s.user_id = pc.student_id
    JOIN class_students cs ON cs.student_id = s.id
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);

-- Helper function to record messages
CREATE OR REPLACE FUNCTION record_pivot_message(
  p_conversation_id UUID,
  p_sender TEXT,
  p_message_text TEXT,
  p_message_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
  v_next_sequence INTEGER;
BEGIN
  SELECT COALESCE(MAX(sequence_number), 0) + 1
  INTO v_next_sequence
  FROM pivot_messages
  WHERE conversation_id = p_conversation_id;
  
  INSERT INTO pivot_messages (
    conversation_id,
    sender,
    message_text,
    message_type,
    sequence_number
  ) VALUES (
    p_conversation_id,
    p_sender,
    p_message_text,
    p_message_type,
    v_next_sequence
  ) RETURNING id INTO v_message_id;
  
  UPDATE pivot_conversations
  SET 
    total_exchanges = total_exchanges + 1,
    updated_at = NOW()
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$;