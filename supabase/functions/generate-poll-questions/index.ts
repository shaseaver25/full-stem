import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

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
    const { lessonId, pollType, questionCount = 3, context } = await req.json();

    if (!lessonId || !pollType) {
      return new Response(
        JSON.stringify({ error: 'lessonId and pollType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseKey || !lovableApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lesson content
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return new Response(
        JSON.stringify({ error: 'Lesson not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct AI prompt based on poll type
    let systemPrompt = `You are an educational poll question generator. Create engaging poll questions based on lesson content.`;
    let userPrompt = '';

    const lessonContext = `
Lesson Title: ${lesson.title || 'Untitled'}
Description: ${lesson.description || 'No description'}
Content Preview: ${(lesson.text || '').substring(0, 2000)}
${context ? `Additional Context: ${context}` : ''}
    `.trim();

    if (pollType === 'single_choice') {
      userPrompt = `
Based on this lesson content, generate ${questionCount} engaging poll question(s) for classroom participation with 4 answer options each.

${lessonContext}

For each poll question, provide:
1. An engaging question that checks for understanding or opinion
2. 4 plausible answer options (one clearly best, but all reasonable)
3. Brief explanation of why option is best

Format as JSON array:
[
  {
    "question": "Which best describes...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "bestOption": 0,
    "explanation": "Option A is best because..."
  }
]

Make questions engaging and conversational for live classroom use.
      `.trim();
    } else if (pollType === 'rating_scale') {
      userPrompt = `
Based on this lesson content, generate ${questionCount} self-reflection rating question(s) for students to assess their understanding.

${lessonContext}

Create questions that ask students to rate their confidence or understanding on a 1-5 scale.

Format as JSON array:
[
  {
    "question": "How confident are you in...",
    "scale": "1 = Not confident, 5 = Very confident",
    "purpose": "Assess student confidence in applying concept"
  }
]
      `.trim();
    } else if (pollType === 'word_cloud') {
      userPrompt = `
Based on this lesson content, generate ${questionCount} thought-provoking word cloud prompt(s) for open-ended student responses.

${lessonContext}

Create prompts that elicit one-word or short phrase responses that reveal understanding or reactions.

Format as JSON array:
[
  {
    "prompt": "Describe [concept] in one word",
    "purpose": "Gauge emotional response and quick associations"
  }
]

Examples: "In one word, how does this make you feel?", "What's the most important word from this lesson?"
      `.trim();
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported poll type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI gateway error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';

    // Log AI usage
    try {
      const usage = aiResult.usage || {};
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

      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        action_type: 'poll_generation',
        model: 'google/gemini-2.5-flash',
        tokens_used: totalTokens,
        estimated_cost: estimatedCost,
        metadata: {
          lesson_id: lessonId,
          poll_type: pollType,
          question_count: questionCount,
          input_tokens: inputTokens,
          output_tokens: outputTokens
        }
      });
      console.log('AI usage logged successfully');
    } catch (logError) {
      console.error('Failed to log AI usage:', logError);
      // Don't fail the request if logging fails
    }

    // Parse JSON from AI response
    let pollQuestions = [];
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      pollQuestions = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', aiContent }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add IDs to questions
    pollQuestions = pollQuestions.map((q: any, idx: number) => ({
      ...q,
      id: `generated-${Date.now()}-${idx}`,
    }));

    return new Response(
      JSON.stringify({ pollQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating poll questions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
