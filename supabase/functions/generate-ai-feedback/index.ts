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
    const { submissionId, submissionText, grade, teacherFeedback, preferredLanguage = 'en' } = await req.json();
    
    console.log('Generating AI feedback for submission:', submissionId);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create personalized system prompt based on student's language
    const languageInstruction = preferredLanguage === 'en' 
      ? '' 
      : `Respond in ${preferredLanguage} language.`;

    const systemPrompt = `You are an encouraging AI tutor providing personalized learning tips to students. 
${languageInstruction}
Analyze the student's work and provide:
1. One specific strength you noticed
2. One actionable suggestion for improvement
3. One encouraging tip for continued growth

Keep your response concise (2-3 sentences) and age-appropriate for middle/high school students.`;

    const userPrompt = `Student Submission: "${submissionText}"
${grade ? `Grade Received: ${grade}%` : 'Grade: Pending'}
${teacherFeedback ? `Teacher Feedback: "${teacherFeedback}"` : ''}

Provide personalized learning tips for this student.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiFeedback = data.choices[0].message.content;

    console.log('AI feedback generated successfully');

    // Update the submission with AI feedback
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('assignment_submissions')
      .update({ ai_feedback: aiFeedback })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission with AI feedback:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ feedback: aiFeedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ai-feedback:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate AI feedback' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
