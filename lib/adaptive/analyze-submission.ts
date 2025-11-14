import { supabase } from '@/integrations/supabase/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface AnalyzeSubmissionParams {
  submissionId: string;
  rubricId?: string;
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels?: Array<{
    score: number;
    description: string;
  }>;
}

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

export async function analyzeSubmission({
  submissionId,
  rubricId
}: AnalyzeSubmissionParams) {
  try {
    // Update submission status to analyzing
    await supabase
      .from('student_submissions')
      .update({ status: 'analyzing' })
      .eq('id', submissionId);

    // Fetch submission with assignment details
    const { data: submission, error: submissionError } = await supabase
      .from('student_submissions')
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
      .single();

    if (submissionError || !submission) {
      throw new Error('Failed to fetch submission');
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
        console.warn('Failed to fetch rubric, continuing without it');
      } else {
        rubric = rubricData;
      }
    }

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt(submission, rubric);

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'You are an experienced K-12 educator analyzing student work. Provide encouraging, constructive, and actionable feedback. Be specific and supportive.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

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
      .from('student_submissions')
      .update({ status: 'analyzed' })
      .eq('id', submissionId);

    return {
      success: true,
      analysis: analysisRecord,
      submission
    };
  } catch (error) {
    console.error('Error analyzing submission:', error);
    
    // Update submission status to submitted (revert)
    await supabase
      .from('student_submissions')
      .update({ status: 'submitted' })
      .eq('id', submissionId);

    throw error;
  }
}

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

    prompt += `
## Required Output Format
Provide your analysis as a JSON object with the following structure:

{
  "rubric_scores": {
    "${rubric.criteria[0]?.id}": {
      "score": <number between 0 and ${rubric.criteria[0]?.max_points}>,
      "maxScore": ${rubric.criteria[0]?.max_points},
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
