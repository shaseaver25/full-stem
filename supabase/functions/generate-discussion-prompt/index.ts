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
    const { lessonTitle, lessonContent, componentId } = await req.json();
    
    if (!lessonTitle || !componentId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create AI prompt for discussion generation
    const systemPrompt = `You are an expert educator creating thought-provoking discussion prompts for students. 
Your goal is to create engaging questions that:
- Encourage critical thinking and deep analysis
- Connect to real-world applications
- Promote respectful debate and multiple perspectives
- Are appropriate for the lesson content and student level

Generate ONE discussion prompt that is clear, specific, and encourages students to think deeply about the topic.`;

    const userPrompt = `Lesson Title: ${lessonTitle}

${lessonContent ? `Lesson Content: ${lessonContent.substring(0, 500)}...` : ''}

Generate a single, thought-provoking discussion prompt (2-3 sentences) that encourages students to engage deeply with this lesson content.`;

    console.log('Calling Lovable AI for discussion prompt generation...');

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service payment required. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('Failed to generate discussion prompt');
    }

    const aiData = await aiResponse.json();
    const prompt = aiData.choices[0].message.content;

    console.log('Discussion prompt generated successfully');

    return new Response(
      JSON.stringify({ prompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-discussion-prompt:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate discussion prompt' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
