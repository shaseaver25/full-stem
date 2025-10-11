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
    // Extract and verify authorization token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { submissionId, submissionText, grade, teacherFeedback, preferredLanguage = 'en' } = await req.json();
    
    // Input validation
    if (!submissionId || !submissionText) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: submissionId and submissionText" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns this submission before processing
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership of submission
    const { data: submission, error: ownershipError } = await supabaseAuth
      .from('assignment_submissions')
      .select('user_id')
      .eq('id', submissionId)
      .single();

    if (ownershipError || !submission) {
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (submission.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: You can only generate feedback for your own submissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize submission text
    if (typeof submissionText !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid submission text format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Length limit: 5000 characters
    const sanitizedText = submissionText.substring(0, 5000).trim();
    
    // Detect potential prompt injection
    const suspiciousPatterns = [
      'ignore previous',
      'ignore all previous',
      'disregard previous',
      'system prompt',
      'override instructions',
      'forget everything'
    ];
    
    const lowerText = sanitizedText.toLowerCase();
    if (suspiciousPatterns.some(pattern => lowerText.includes(pattern))) {
      return new Response(
        JSON.stringify({ error: "Invalid submission content detected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
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

    const userPrompt = `Student Submission: "${sanitizedText}"
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
