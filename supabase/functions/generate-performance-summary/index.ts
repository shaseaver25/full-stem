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
    const { grades, preferredLanguage = 'en' } = await req.json();
    
    // Input validation
    if (!grades || !Array.isArray(grades)) {
      return new Response(
        JSON.stringify({ error: "Invalid grades format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit number of submissions to prevent excessive API costs
    const maxSubmissions = 50;
    const limitedGrades = grades.slice(0, maxSubmissions);
    
    console.log('Generating performance summary for', limitedGrades.length, 'submissions');

    if (limitedGrades.length === 0) {
      return new Response(
        JSON.stringify({ summary: "Complete some assignments to see your personalized performance summary!" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate basic statistics
    const gradedSubmissions = limitedGrades.filter((g: any) => g.grade !== null && g.grade !== undefined);
    const averageGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum: number, g: any) => sum + g.grade, 0) / gradedSubmissions.length
      : 0;

    const languageInstruction = preferredLanguage === 'en' 
      ? '' 
      : `Respond in ${preferredLanguage} language.`;

    const systemPrompt = `You are an encouraging AI academic advisor providing a personalized performance summary to a student.
${languageInstruction}
Based on their grades and submissions, provide:
1. Overall assessment (1 sentence about their performance level)
2. Key strengths (1-2 specific areas where they excel)
3. Growth opportunities (1-2 actionable areas to focus on)
4. Motivational conclusion (1 encouraging sentence)

Keep the summary concise (4-5 sentences total) and age-appropriate for middle/high school students.`;

    const submissionSummary = gradedSubmissions
      .map((g: any) => {
        // Sanitize and limit feedback length
        const feedback = (g.teacherFeedback || 'None').substring(0, 200);
        const title = (g.assignmentTitle || 'Untitled').substring(0, 100);
        return `Assignment: ${title}, Grade: ${g.grade}%, Feedback: ${feedback}`;
      })
      .join('\n');

    const userPrompt = `Student has completed ${gradedSubmissions.length} graded assignments with an average grade of ${averageGrade.toFixed(1)}%.

Submissions:
${submissionSummary}

Provide a personalized performance summary.`;

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
        max_tokens: 400,
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
    const summary = data.choices[0].message.content;

    console.log('Performance summary generated successfully');

    return new Response(
      JSON.stringify({ summary }),
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
