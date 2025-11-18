import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const { studentAnswer, acceptableAnswers } = await req.json();

    if (!studentAnswer || !acceptableAnswers || !Array.isArray(acceptableAnswers)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: studentAnswer, acceptableAnswers' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt
    const acceptableAnswersList = acceptableAnswers.map((ans, i) => `${i + 1}. ${ans}`).join('\n');
    
    const prompt = `You are an AI teaching assistant. Your task is to grade a student's short answer. You will be given the student's exact answer and a list of acceptable correct answers.

Determine if the student's answer is "close enough" to be considered correct. The student does not need to use the exact same words, but their answer must match the meaning of one of the acceptable answers.

1. List of Acceptable Answers:
${acceptableAnswersList}

2. Student's Answer:
${studentAnswer}

3. Your Task: Compare the "Student's Answer" to the "List of Acceptable Answers."

If the student's answer is a close match in meaning to any of the acceptable answers, respond with only the word: "correct"

If the student's answer is not a close match, respond with only the word: "incorrect"`;

    console.log('Sending grading request to AI');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.1, // Low temperature for consistent grading
        max_tokens: 50, // Short response needed
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI grading failed' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim().toLowerCase();
    
    console.log('AI grading response:', aiResponse);

    // Parse the AI response
    const isCorrect = aiResponse.includes('correct') && !aiResponse.includes('incorrect');

    // Log AI usage
    try {
      const usage = data.usage || {};
      const inputTokens = usage.prompt_tokens || 0;
      const outputTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || inputTokens + outputTokens;
      
      // Gemini pricing: ~$0.00025 per 1K input, ~$0.001 per 1K output
      const estimatedCost = (inputTokens / 1000) * 0.00025 + (outputTokens / 1000) * 0.001;

      // Get user_id if authenticated
      let userId = null;
      if (authHeader) {
        try {
          const tokenPayload = JSON.parse(atob(authHeader.replace('Bearer ', '').split('.')[1]));
          userId = tokenPayload.sub;
        } catch (e) {
          console.log('Could not extract user_id from token');
        }
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('ai_usage_logs').insert({
          user_id: userId,
          action_type: 'short_answer_grading',
          model: 'google/gemini-2.5-flash',
          tokens_used: totalTokens,
          estimated_cost: estimatedCost,
          metadata: {
            answer_length: studentAnswer.length,
            score_given: isCorrect ? 1 : 0,
            question_id: null, // Not available in current request
            quiz_attempt_id: null, // Not available in current request
            acceptable_answers_count: acceptableAnswers.length,
            input_tokens: inputTokens,
            output_tokens: outputTokens
          }
        });
        console.log('AI usage logged successfully');
      }
    } catch (logError) {
      console.error('Failed to log AI usage:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        isCorrect,
        aiResponse: data.choices[0].message.content.trim(),
        studentAnswer,
        confidence: isCorrect ? 'high' : 'medium' // Could be enhanced with more sophisticated parsing
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in grade-short-answer function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
