import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { submissions, preferredLanguage = 'en' } = await req.json();
    
    // Input validation - support both 'submissions' and 'grades' for backward compatibility
    const gradesArray = submissions || [];
    
    if (!Array.isArray(gradesArray)) {
      return new Response(
        JSON.stringify({ error: "Invalid submissions format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit number of submissions to prevent excessive API costs
    const maxSubmissions = 50;
    const limitedSubmissions = gradesArray.slice(0, maxSubmissions);
    
    console.log('Generating performance summary for', limitedSubmissions.length, 'submissions');

    if (limitedSubmissions.length === 0) {
      return new Response(
        JSON.stringify({ feedback: "Complete some assignments to see your personalized performance summary!" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build summary from submissions
    const submissionsSummary = limitedSubmissions
      .map((s: any) => {
        const title = (s.assignment_title || s.assignmentTitle || 'Untitled').substring(0, 100);
        const grade = s.grade || 'N/A';
        const feedback = (s.feedback || s.teacherFeedback || 'None').substring(0, 200);
        return `Assignment: ${title}\nGrade: ${grade}\nFeedback: ${feedback}`;
      })
      .join('\n\n');

    const prompt = `
You are an educational AI that summarizes student performance based on multiple assignments.
Here is their work summary:
${submissionsSummary}

Write a paragraph in ${preferredLanguage || "English"} summarizing:
- The student's overall progress
- Top 1–2 strengths
- One area to improve
- Keep tone positive and motivational
- Limit to 4 sentences maximum
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 400,
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
    const feedback = data.choices[0].message.content.trim();

    console.log('Performance summary generated successfully');

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-performance-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate performance summary' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
