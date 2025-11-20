import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      conversationId,
      questionText,
      correctAnswer,
      questionType,
      previousHints,
      conversationHistory,
      hintNumber
    } = await req.json();
    
    console.log('🔄 Generating hint:', { conversationId, hintNumber });
    
    // Build context from conversation
    const conversationContext = conversationHistory
      .slice(-6) // Last 3 exchanges
      .map((msg: any) => `${msg.sender}: ${msg.text}`)
      .join('\n');
    
    // Build hint progression prompt
    const systemPrompt = `You are generating Hint #${hintNumber} of 3 for a student working on this problem.

QUESTION: ${questionText}
CORRECT ANSWER (reference only): ${correctAnswer}
QUESTION TYPE: ${questionType}

CONVERSATION SO FAR:
${conversationContext}

PREVIOUS HINTS GIVEN:
${previousHints.length > 0 ? previousHints.map((h: any, i: number) => `Hint ${i + 1}: ${h}`).join('\n') : 'None'}

HINT RULES:
1. NEVER give the direct answer
2. Make each hint more specific than the last
3. Hint 1: Point to the general concept or approach
4. Hint 2: Break down the problem into steps or components
5. Hint 3: Almost walk them through, but stop just short of the answer
6. Use simple, encouraging language
7. Frame as a question when possible ("Have you tried...?", "What if you...?")
8. Keep under 50 words

HINT PROGRESSION EXAMPLES:
Question: "What is 24 ÷ 6?"
- Hint 1: "Think about division as sharing equally. If you had 24 items to share with 6 people, how many would each person get?"
- Hint 2: "Try counting by 6s: 6, 12, 18, 24. How many times did you count?"
- Hint 3: "You're looking for how many groups of 6 fit into 24. Try using your fingers or drawing circles."

Question: "Why do leaves change color in fall?"
- Hint 1: "Think about what leaves do in summer. What role does sunlight play?"
- Hint 2: "The green color (chlorophyll) helps make food. What happens when there's less sunlight in fall?"
- Hint 3: "When chlorophyll breaks down, other colors that were hidden appear. What colors are under the green?"

Generate Hint #${hintNumber} that follows this progression. Be specific enough to be helpful but don't give the answer.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate hint ${hintNumber} for this student.` }
        ],
        temperature: 0.6,
        max_tokens: 150
      })
    });
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI request failed:', aiResponse.status, errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }
    
    const aiData = await aiResponse.json();
    const hintText = aiData.choices[0].message.content;
    
    console.log('✅ Generated hint:', hintText);
    
    // Store hint in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: hint, error: hintError } = await supabase
      .from('pivot_hints')
      .insert({
        conversation_id: conversationId,
        hint_text: hintText,
        was_used: true
      })
      .select()
      .single();
    
    if (hintError) {
      console.error('❌ Error storing hint:', hintError);
      throw hintError;
    }
    
    // Record hint as a message
    const { error: messageError } = await supabase
      .rpc('record_pivot_message', {
        p_conversation_id: conversationId,
        p_sender: 'pivot',
        p_message_text: `💡 Hint ${hintNumber}/3: ${hintText}`,
        p_message_type: 'hint'
      });
    
    if (messageError) {
      console.error('❌ Error recording hint message:', messageError);
      throw messageError;
    }
    
    console.log('✅ Hint stored successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        hint: {
          id: hint.id,
          text: hintText,
          hintNumber
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('💥 Hint generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
