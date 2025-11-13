import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AITutorChatProps {
  lessonId: string;
  lessonTitle: string;
  lessonObjectives?: string;
}

export function AITutorChat({ lessonId, lessonTitle, lessonObjectives }: AITutorChatProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  // Check rate limit
  const { data: rateLimitData } = useQuery({
    queryKey: ['tutor-rate-limit', user?.id, lessonId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('ai_tutor_usage')
        .select('questions_asked')
        .eq('user_id', user?.id)
        .eq('lesson_id', lessonId)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      const asked = data?.questions_asked || 0;
      return {
        questionsAsked: asked,
        questionsRemaining: Math.max(0, 5 - asked),
        canAsk: asked < 5,
      };
    },
    enabled: !!user && isOpen,
    refetchInterval: 30000,
  });

  // Get or create conversation
  const { data: conversation } = useQuery({
    queryKey: ['tutor-conversation', user?.id, lessonId],
    queryFn: async () => {
      const { data: existing, error: fetchError } = await supabase
        .from('ai_tutor_conversations')
        .select('id')
        .eq('user_id', user?.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        return existing;
      }

      const { data: newConv, error: createError } = await supabase
        .from('ai_tutor_conversations')
        .insert({
          user_id: user?.id,
          lesson_id: lessonId,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newConv;
    },
    enabled: !!user && isOpen,
  });

  // Load message history
  const { data: messages = [] } = useQuery({
    queryKey: ['tutor-messages', conversation?.id],
    queryFn: async () => {
      if (!conversation?.id) return [];

      const { data, error } = await supabase
        .from('ai_tutor_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        const welcomeMessage = {
          role: 'assistant',
          content: `Hi! I'm here to help you learn about "${lessonTitle}". 

I won't give you direct answers, but I'll ask questions to help you think through problems yourself. What would you like to explore?`,
          created_at: new Date().toISOString(),
        };
        
        await supabase.from('ai_tutor_messages').insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: welcomeMessage.content,
        });
        
        return [welcomeMessage];
      }
      
      return data;
    },
    enabled: !!conversation?.id,
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      if (!conversation?.id) throw new Error('No conversation found');
      if (!rateLimitData?.canAsk) throw new Error('Rate limit exceeded');

      const { error: saveError } = await supabase
        .from('ai_tutor_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'user',
          content: userMessage,
        });

      if (saveError) throw saveError;

      const { error: usageError } = await supabase.rpc('increment_tutor_usage', {
        p_user_id: user?.id,
        p_lesson_id: lessonId,
      });

      if (usageError) throw usageError;

      const recentMessages = messages
        .slice(-10)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

      recentMessages.push({
        role: 'user',
        content: userMessage,
      });

      const systemPrompt = `You are an educational AI tutor helping a student learn about: "${lessonTitle}"

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. NEVER give direct answers to homework or assessment questions
2. NEVER write essays, complete assignments, or do work for the student
3. Use Socratic questioning: ask guiding questions that help students think through problems
4. Stay strictly within the scope of this lesson - don't introduce external information
5. If a student asks you to write their essay or do their homework, politely decline and guide them to think through it themselves
6. Break complex problems into smaller steps through questions
7. Encourage the student to explain their reasoning before providing guidance
8. Praise effort and thinking process, not just correct answers
9. Keep responses concise (under 150 words)

${lessonObjectives ? `LESSON OBJECTIVES:\n${lessonObjectives}\n` : ''}

SOCRATIC APPROACH:
When a student asks a question:
- First, ask them what they already know about the topic
- Then guide them with questions like "What would happen if...?" or "Can you think of an example where...?"
- If they're genuinely stuck, provide a small hint or analogy, not the full answer
- Always end by asking them to explain their understanding back to you

EXAMPLE INTERACTIONS:
Student: "What is Higher-Order Thinking?"
You: "Great question! Before I explain, can you think of a time when you had to do more than just memorize facts - when you really had to analyze or evaluate something? What was that like?"

Student: "Can you write my essay on AI-resistant assessments?"
You: "I can't write your essay, but I can help you think through it! Let's start with the first step: What do you think makes an assessment AI-resistant? What ideas come to mind?"

Remember: Your goal is to help them LEARN and THINK, not to do the work for them.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: systemPrompt,
          messages: recentMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const assistantMessage = data.content[0].text;
      const tokensUsed = data.usage?.output_tokens || 0;

      const { error: saveAssistantError } = await supabase
        .from('ai_tutor_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: assistantMessage,
          tokens_used: tokensUsed,
        });

      if (saveAssistantError) throw saveAssistantError;

      await supabase
        .from('ai_tutor_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          message_count: (messages?.length || 0) + 2,
        })
        .eq('id', conversation.id);

      return assistantMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-messages', conversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['tutor-rate-limit', user?.id, lessonId] });
      setInputValue('');
      setTimeout(scrollToBottom, 100);
    },
    onError: (error: Error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: error.message || 'Please try again in a moment.',
      });
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !rateLimitData?.canAsk) return;

    const userMessage = inputValue.trim();
    setIsLoading(true);

    try {
      await sendMessageMutation.mutateAsync(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 rounded-full h-16 w-16 shadow-2xl z-50 hover:scale-110 transition-transform"
          title="AI Tutor - Get help learning this lesson"
        >
          <Bot className="h-7 w-7" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[420px] h-[650px] shadow-2xl flex flex-col z-50 border-2">
          <CardHeader className="border-b bg-primary/5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Learning Tutor</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Socratic questioning • FERPA compliant
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {rateLimitData && (
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Questions remaining today:
                </span>
                <span className="font-medium">
                  {rateLimitData.questionsRemaining} / 5
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="border-t p-4">
            {rateLimitData?.canAsk ? (
              <div className="flex gap-2 w-full">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about this lesson..."
                  rows={2}
                  className="resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="h-auto"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <div className="text-center py-4 px-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-1">
                    Daily Question Limit Reached
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You've used all 5 questions for this lesson today. Try again tomorrow!
                  </p>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </>
  );
}
