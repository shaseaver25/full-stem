import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
