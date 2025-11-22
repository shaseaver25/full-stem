import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, lessonId, lessonTitle, lessonContent } = await req.json();
    
    if (!message || !lessonId) {
      throw new Error('Message and lessonId are required');
    }

    // Get API keys
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    let currentConversationId = conversationId;

    // Create or update conversation
    if (!currentConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('ai_tutor_conversations')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          started_at: new Date().toISOString(),
          message_count: 1
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      currentConversationId = newConversation.id;
    } else {
      // Update conversation metadata
      await supabase
        .from('ai_tutor_conversations')
        .update({
          message_count: supabase.rpc('increment', { x: 1 }),
          last_message_at: new Date().toISOString()
        })
        .eq('id', currentConversationId);
    }

    // Save user message
    await supabase
      .from('ai_tutor_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message
      });

    // Get conversation history
    const { data: messages, error: msgError } = await supabase
      .from('ai_tutor_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      throw msgError;
    }

    // Build Socratic tutor system prompt
    const systemPrompt = `You are a Socratic tutor helping a student understand concepts from their lesson. Your role is to guide students to discover answers themselves through thoughtful questioning, rather than directly providing answers.

Key Guidelines:
1. Ask guiding questions that help students think through problems step-by-step
2. Break down complex concepts into smaller, manageable parts
3. Encourage critical thinking by asking "why" and "how" questions
4. Acknowledge correct reasoning and gently redirect when needed
5. Be patient, supportive, and encouraging
6. Use examples and analogies when appropriate
7. If a student is truly stuck after several attempts, provide hints rather than full answers

Current Lesson Context:
- Title: ${lessonTitle || 'Current Lesson'}
- Content Summary: ${lessonContent ? lessonContent.substring(0, 500) : 'General lesson content'}

Remember: Your goal is to help students learn by thinking, not by memorizing answers you provide.`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service requires payment. Please contact your administrator.');
      }
      throw new Error('Failed to get AI response');
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from AI');
    }

    // Save assistant message
    await supabase
      .from('ai_tutor_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: assistantMessage
      });

    // Track usage
    await supabase
      .from('ai_tutor_usage')
      .insert({
        lesson_id: lessonId,
        user_id: user.id,
        question_count: 1,
        tokens_used: aiData.usage?.total_tokens || 0
      });

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        conversationId: currentConversationId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in socratic-tutor function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
