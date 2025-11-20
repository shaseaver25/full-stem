import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      conversationId,
      studentMessage,
      context
    } = await req.json();
    
    const { questionText, correctAnswer, previousMessages, hintsUsed, gradeLevel } = context;
    
    console.log('🔄 Pivot Chat Request:', {
      conversationId,
      questionText: questionText?.substring(0, 50),
      messageCount: previousMessages?.length,
      hintsUsed
    });
    
    // Build conversation history
    const conversationHistory = (previousMessages || []).map((msg: any) => ({
      role: msg.sender === 'student' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    // Socratic system prompt
    const systemPrompt = `You are Pivot, an AI learning assistant that uses Socratic questioning to help students discover answers on their own. You NEVER give direct answers.

CONTEXT:
- Student Grade Level: ${gradeLevel || 'Unknown'}
- Question: ${questionText}
- Correct Answer (for reference only - DO NOT share): ${correctAnswer}
- Hints Used: ${hintsUsed}/3
- Exchange Count: ${Math.floor(conversationHistory.length / 2)}

CORE RULES:
1. Always respond with questions, not answers
2. Validate partial understanding ("You're on the right track!")
3. Break complex problems into smaller steps
4. Keep responses to 2-3 sentences max
5. Use simple, clear language appropriate for grade level
6. If student is stuck after 5+ exchanges, suggest they use a hint or flag for teacher
7. Never say "wrong" - instead ask "Let's think about that together..."
8. Celebrate effort and progress

RESPONSE STRUCTURE:
1. Acknowledge what student said (validate or gently redirect)
2. Ask ONE guiding question
3. End with encouragement or clear next step

EXAMPLE RESPONSES:
- "I like how you're thinking! Let me ask you this: What do you notice about the numbers in the problem?"
- "You're getting closer! Before we move forward, can you explain why you think that's the answer?"
- "Great question! What do you already know about [concept] that might help?"`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: studentMessage }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI Gateway Error:', aiResponse.status, errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }
    
    const aiData = await aiResponse.json();
    const pivotResponse = aiData.choices[0].message.content;
    
    console.log('✅ Got AI response:', pivotResponse.substring(0, 100));
    
    // Store message in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: messageId, error: messageError } = await supabase
      .rpc('record_pivot_message', {
        p_conversation_id: conversationId,
        p_sender: 'pivot',
        p_message_text: pivotResponse,
        p_message_type: 'question'
      });
    
    if (messageError) {
      console.error('❌ Database Error:', messageError);
      throw messageError;
    }
    
    console.log('✅ Message stored:', messageId);
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId,
        text: pivotResponse,
        messageType: 'question'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('💥 Pivot chat error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
