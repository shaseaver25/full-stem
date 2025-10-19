import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const authHeader = req.headers.get('Authorization');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client for logging
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader! },
        },
      }
    );

    // Get authenticated user for logging
    const { data: { user } } = await supabase.auth.getUser();

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No content provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing syllabus content with AI, length:', content.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a lesson plan parser. Extract structured information from syllabus/lesson plan text and return it as JSON.
Extract: title, description, subject, gradeLevel, duration, learningObjectives (array or string), prerequisites.
Only include fields that are clearly present in the text. Return valid JSON only, no markdown.`
          },
          {
            role: 'user',
            content: `Parse this syllabus/lesson plan and extract the structured information:\n\n${content}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const aiResponse = await response.json();
    const parsedContent = aiResponse.choices?.[0]?.message?.content;
    const usage = aiResponse.usage;

    if (!parsedContent) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received, length:', parsedContent.length);
    console.log('Token usage:', usage);

    // Log AI usage to database
    if (user && usage) {
      const estimatedCost = ((usage.prompt_tokens || 0) * 0.00000015) + ((usage.completion_tokens || 0) * 0.0000006); // Gemini Flash pricing
      
      await supabase.from('ai_lesson_history').insert({
        user_id: user.id,
        model_provider: 'lovable-ai',
        model_name: 'google/gemini-2.5-flash',
        input_tokens: usage.prompt_tokens || 0,
        output_tokens: usage.completion_tokens || 0,
        estimated_cost: estimatedCost,
        prompt_preview: content.substring(0, 500),
        response_preview: parsedContent.substring(0, 500),
        metadata: { endpoint: 'parse-lesson-plan' },
      });
    }

    // Try to parse the JSON response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = parsedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parsedContent);
      // Return a basic structure if parsing fails
      parsedData = {
        title: '',
        description: content.substring(0, 200),
        error: 'Could not fully parse syllabus. Please review and edit manually.'
      };
    }

    console.log('Successfully parsed lesson data');

    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-lesson-plan function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse syllabus',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
