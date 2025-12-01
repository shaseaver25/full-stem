import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAssessmentRequest {
  classId: string;
  lessonIds: string[];
  assessmentTitle: string;
  numberOfQuestions: number;
  questionTypes: {
    multipleChoice: number;
    trueFalse: number;
    shortAnswer: number;
    essay: number;
  };
  difficulty: string;
  focusAreas?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No Authorization header found');
      throw new Error('Unauthorized: No authorization header');
    }

    console.log('Auth header present:', authHeader.substring(0, 20) + '...');

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error('Auth verification error:', userError.message);
      throw new Error(`Unauthorized: ${userError.message}`);
    }
    
    if (!user) {
      console.error('No user found after auth verification');
      throw new Error('Unauthorized: Auth session missing!');
    }
    
    console.log('Successfully authenticated user:', user.id);

    const body: GenerateAssessmentRequest = await req.json();
    console.log('Generate assessment request:', body);

    // Fetch lesson content
    const { data: lessons, error: lessonsError } = await supabaseClient
      .from('lessons')
      .select(`
        id,
        title,
        description,
        learning_objectives,
        lesson_components (
          id,
          component_type,
          title,
          content,
          order_index
        )
      `)
      .in('id', body.lessonIds)
      .order('order_index');

    if (lessonsError) throw lessonsError;

    // Aggregate lesson content into context
    let contentContext = '';
    lessons?.forEach((lesson: any) => {
      contentContext += `\n\n=== LESSON: ${lesson.title} ===\n`;
      if (lesson.description) {
        contentContext += `Description: ${lesson.description}\n`;
      }
      if (lesson.learning_objectives) {
        contentContext += `Objectives: ${lesson.learning_objectives}\n`;
      }
      
      contentContext += '\nContent Components:\n';
      lesson.lesson_components?.forEach((comp: any) => {
        contentContext += `\n[${comp.component_type}] ${comp.title || 'Untitled'}\n`;
        if (comp.content) {
          // Parse content if it's JSON
          try {
            const parsed = JSON.parse(comp.content);
            if (parsed.body) {
              contentContext += `${parsed.body}\n`;
            }
          } catch {
            contentContext += `${comp.content}\n`;
          }
        }
      });
    });

    console.log('Aggregated content length:', contentContext.length);

    // Calculate question distribution
    const distribution = {
      multipleChoice: Math.round(body.numberOfQuestions * body.questionTypes.multipleChoice / 100),
      trueFalse: Math.round(body.numberOfQuestions * body.questionTypes.trueFalse / 100),
      shortAnswer: Math.round(body.numberOfQuestions * body.questionTypes.shortAnswer / 100),
      essay: Math.round(body.numberOfQuestions * body.questionTypes.essay / 100),
    };

    // Adjust for rounding errors
    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
    if (total < body.numberOfQuestions) {
      distribution.multipleChoice += body.numberOfQuestions - total;
    }

    const SYSTEM_PROMPT = `You are an expert educational assessment designer. Generate comprehensive assessment questions based on the provided lesson content.

Requirements:
- Questions must align with lesson learning objectives
- Vary difficulty levels appropriately
- Include distractors that reveal common misconceptions for multiple choice
- Short answers should have clear grading rubrics
- Essays should include detailed rubrics with point allocation
- All questions must be pedagogically sound and age-appropriate

Format each question as JSON with:
{
  "questionType": "multiple_choice" | "true_false" | "short_answer" | "essay",
  "questionText": "Clear, specific question",
  "points": number,
  "sourceLessonId": "uuid-of-source-lesson",
  "difficulty": "easy" | "medium" | "hard",
  
  // For multiple choice:
  "options": [
    {"id": "a", "text": "Option text", "isCorrect": true/false},
    {"id": "b", "text": "Option text", "isCorrect": true/false},
    {"id": "c", "text": "Option text", "isCorrect": true/false},
    {"id": "d", "text": "Option text", "isCorrect": true/false}
  ],
  
  // For true/false:
  "options": [
    {"id": "true", "text": "True", "isCorrect": true/false},
    {"id": "false", "text": "False", "isCorrect": true/false}
  ],
  
  // For short answer:
  "correctAnswer": "Expected answer",
  "rubric": "How to evaluate answer",
  
  // For essay:
  "rubric": "Detailed rubric with criteria and point values",
  "maxLength": number
}`;

    const USER_PROMPT = `Generate ${body.numberOfQuestions} assessment questions for: "${body.assessmentTitle}"

LESSON CONTENT:
${contentContext}

DISTRIBUTION:
- Multiple Choice: ${distribution.multipleChoice} questions
- True/False: ${distribution.trueFalse} questions
- Short Answer: ${distribution.shortAnswer} questions
- Essay: ${distribution.essay} questions

DIFFICULTY: ${body.difficulty}

${body.focusAreas ? `FOCUS AREAS: ${body.focusAreas}` : ''}

Return ONLY a JSON array of questions. No markdown, no explanation, just the raw JSON array.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: USER_PROMPT }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits depleted. Please add funds to continue.');
      }
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    let questionsText = aiData.choices[0].message.content;

    // Clean up response if it has markdown code blocks
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('AI response length:', questionsText.length);
    
    let questions;
    try {
      questions = JSON.parse(questionsText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', questionsText);
      throw new Error('Invalid AI response format');
    }

    if (!Array.isArray(questions)) {
      throw new Error('AI did not return an array of questions');
    }

    console.log('Generated questions:', questions.length);

    // Create assessment
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('class_assessments')
      .insert({
        class_id: body.classId,
        title: body.assessmentTitle,
        created_by: user.id,
        total_points: questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0),
      })
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Create questions
    const questionInserts = questions.map((q: any, index: number) => ({
      assessment_id: assessment.id,
      question_type: q.questionType,
      question_text: q.questionText,
      points: q.points || 1,
      display_order: index,
      options: q.options ? JSON.stringify(q.options) : null,
      correct_answer: q.correctAnswer || null,
      rubric: q.rubric || null,
      max_length: q.maxLength || null,
      source_lesson_id: q.sourceLessonId || null,
      ai_generated: true,
    }));

    const { error: questionsError } = await supabaseClient
      .from('class_assessment_questions')
      .insert(questionInserts);

    if (questionsError) throw questionsError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        assessmentId: assessment.id,
        questionsGenerated: questions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-class-assessment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});