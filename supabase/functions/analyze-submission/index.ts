import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisResult {
  rubric_scores: Record<string, {
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  overall_mastery: 'emerging' | 'developing' | 'proficient' | 'advanced';
  confidence_score: number;
  strengths: string[];
  areas_for_growth: string[];
  misconceptions: string[];
  personalized_feedback: string;
  recommended_action: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { submissionId, rubricId } = await req.json();
    if (!submissionId) {
      return new Response(
        JSON.stringify({ error: "Missing submissionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing submission ${submissionId} with rubric ${rubricId || 'none'}`);

    // Update submission status to analyzing
    await supabase
      .from('assignment_submissions')
      .update({ status: 'analyzing' })
      .eq('id', submissionId);

    // Fetch submission with assignment details
    const { data: submission, error: submissionError } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:assignment_id (
          id,
          title,
          instructions,
          description
        )
      `)
      .eq('id', submissionId)
      .maybeSingle();

    if (submissionError || !submission) {
      throw new Error('Failed to fetch submission: ' + submissionError?.message);
    }

    // Verify user owns this submission or is a teacher
    if (submission.user_id !== user.id) {
      // Check if user is teacher of the class
      const { data: assignment } = await supabase
        .from('class_assignments_new')
        .select('class_id')
        .eq('id', submission.assignment_id)
        .single();

      if (assignment) {
        const { data: classData } = await supabase
          .from('classes')
          .select('teacher_id')
          .eq('id', assignment.class_id)
          .single();

        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('user_id')
          .eq('id', classData?.teacher_id)
          .single();

        if (teacherProfile?.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: "Unauthorized to analyze this submission" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fetch rubric if provided
    let rubric = null;
    if (rubricId) {
      const { data: rubricData, error: rubricError } = await supabase
        .from('rubrics')
        .select(`
          *,
          criteria:rubric_criteria (
            id,
            name,
            description,
            max_points,
            order_index
          )
        `)
        .eq('id', rubricId)
        .single();

      if (rubricError) {
        console.warn('Failed to fetch rubric, continuing without it:', rubricError);
      } else {
        rubric = rubricData;
      }
    }

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt(submission, rubric);

    // Call OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are an experienced K-12 educator analyzing student work. Provide encouraging, constructive, and actionable feedback. Be specific and supportive."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const completion = await openaiResponse.json();
    const rawOutput = completion.choices[0].message.content;
    
    if (!rawOutput) {
      throw new Error('No response from AI model');
    }

    const analysis: AnalysisResult = JSON.parse(rawOutput);

    // Store analysis in database
    const { data: analysisRecord, error: insertError } = await supabase
      .from('submission_analyses')
      .insert({
        submission_id: submissionId,
        rubric_id: rubricId || null,
        rubric_scores: analysis.rubric_scores,
        overall_mastery: analysis.overall_mastery,
        confidence_score: analysis.confidence_score,
        strengths: analysis.strengths,
        areas_for_growth: analysis.areas_for_growth,
        misconceptions: analysis.misconceptions,
        personalized_feedback: analysis.personalized_feedback,
        recommended_action: analysis.recommended_action,
        analyzed_at: new Date().toISOString(),
        model_used: 'gpt-4o',
        raw_model_output: JSON.parse(rawOutput),
        teacher_reviewed: false,
        teacher_modified: false
      })
      .select()
      .single();

    if (insertError) {
      throw new Error('Failed to store analysis: ' + insertError.message);
    }

    // Update submission status to analyzed
    await supabase
      .from('assignment_submissions')
      .update({ status: 'analyzed' })
      .eq('id', submissionId);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisRecord,
        submission
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('Error analyzing submission:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function buildAnalysisPrompt(submission: any, rubric: any | null): string {
  const assignment = submission.assignment;
  const studentWork = typeof submission.content === 'string' 
    ? submission.content 
    : JSON.stringify(submission.content, null, 2);

  let prompt = `Analyze the following student submission and provide a detailed assessment.

## Assignment
**Title:** ${assignment?.title || 'Untitled Assignment'}
**Instructions:** ${assignment?.instructions || 'No instructions provided'}
${assignment?.description ? `**Description:** ${assignment.description}` : ''}

## Student Submission
${studentWork}

`;

  if (rubric && rubric.criteria) {
    prompt += `## Rubric
Evaluate the student's work based on the following criteria:

`;
    
    rubric.criteria
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .forEach((criterion: any) => {
        prompt += `### ${criterion.name}
**Description:** ${criterion.description}
**Maximum Points:** ${criterion.max_points}

`;
      });

    const firstCriterion = rubric.criteria[0];
    prompt += `
## Required Output Format
Provide your analysis as a JSON object with the following structure:

{
  "rubric_scores": {
    "${firstCriterion?.id}": {
      "score": <number between 0 and ${firstCriterion?.max_points}>,
      "maxScore": ${firstCriterion?.max_points},
      "feedback": "<specific feedback for this criterion>"
    }
    // ... for each criterion
  },
  "overall_mastery": "<emerging|developing|proficient|advanced>",
  "confidence_score": <number between 0.0 and 1.0>,
  "strengths": ["<specific strength 1>", "<specific strength 2>", ...],
  "areas_for_growth": ["<specific area 1>", "<specific area 2>", ...],
  "misconceptions": ["<misconception 1 if any>", ...],
  "personalized_feedback": "<encouraging, personalized message to the student>",
  "recommended_action": "<next steps or recommendations>"
}
`;
  } else {
    prompt += `
## Required Output Format
Provide your analysis as a JSON object with the following structure:

{
  "rubric_scores": {},
  "overall_mastery": "<emerging|developing|proficient|advanced>",
  "confidence_score": <number between 0.0 and 1.0>,
  "strengths": ["<specific strength 1>", "<specific strength 2>", ...],
  "areas_for_growth": ["<specific area 1>", "<specific area 2>", ...],
  "misconceptions": ["<misconception 1 if any>", ...],
  "personalized_feedback": "<encouraging, personalized message to the student>",
  "recommended_action": "<next steps or recommendations>"
}
`;
  }

  prompt += `
## Guidelines
- Be encouraging and constructive
- Provide specific examples from the student's work
- Focus on growth and learning
- Identify concrete next steps
- Consider the student's current level and progress
- Be honest but supportive about misconceptions
`;

  return prompt;
}
