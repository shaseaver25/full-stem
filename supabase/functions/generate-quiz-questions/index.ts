import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, questionCount, questionTypes, difficulty } = await req.json();
    
    if (!lessonId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: lessonId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Database service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('title, description, objectives')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError || !lesson) {
      console.error('Error fetching lesson:', lessonError);
      return new Response(
        JSON.stringify({ error: 'Lesson not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch lesson components (pages only for MVP)
    const { data: components, error: componentsError } = await supabase
      .from('lesson_components')
      .select('component_type, content, order')
      .eq('lesson_id', lessonId)
      .eq('enabled', true)
      .in('component_type', ['page'])
      .order('order');

    if (componentsError) {
      console.error('Error fetching components:', componentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch lesson content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract content from page components
    let extractedContent = '';
    let totalWords = 0;

    if (components && components.length > 0) {
      components.forEach((comp, index) => {
        if (comp.component_type === 'page') {
          const pageContent = comp.content?.content || '';
          // Strip HTML tags for cleaner text
          const cleanText = pageContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          const words = cleanText.split(' ').length;
          totalWords += words;
          
          extractedContent += `\n[PAGE ${index + 1}]\n${cleanText}\n`;
        }
      });
    }

    // Check if we have enough content
    if (totalWords < 100) {
      return new Response(
        JSON.stringify({ 
          error: 'insufficient_content',
          message: `Insufficient lesson content to generate quality questions. Found ${totalWords} words. Recommendation: Add at least 300 words of content before generating quiz questions.`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate if too long (keep under 5000 words to fit in AI context)
    if (totalWords > 5000) {
      const words = extractedContent.split(' ');
      extractedContent = words.slice(0, 5000).join(' ') + '...';
    }

    console.log(`Extracted ${totalWords} words from ${components?.length || 0} components`);

    // Create AI prompt for quiz generation
    const systemPrompt = `You are an expert educational assessment designer. Your task is to create high-quality quiz questions based on lesson content provided by a teacher.

REQUIREMENTS:
1. Questions must be directly based on the provided content (not general knowledge)
2. Questions must be clear, unambiguous, and grade-appropriate
3. For multiple choice: Create 4 plausible options with only ONE correct answer
4. Distractors (wrong answers) should be plausible but clearly incorrect to someone who learned the material
5. Avoid trick questions or overly complex language
6. Include brief explanations for correct answers
7. Vary question difficulty according to specified level: ${difficulty || 'medium'}
8. Focus on understanding, not just memorization

OUTPUT FORMAT: Return ONLY valid JSON (no markdown, no other text), structured as an array of question objects.`;

    const userPrompt = `Create ${questionCount || 5} multiple choice quiz questions from the following lesson content.

LESSON INFORMATION:
Title: ${lesson.title || 'Untitled Lesson'}
${lesson.description ? `Description: ${lesson.description}` : ''}
${lesson.objectives && lesson.objectives.length > 0 ? `Learning Objectives: ${lesson.objectives.join(', ')}` : ''}

CONTENT:
${extractedContent}

REQUIREMENTS:
- Number of questions: ${questionCount || 5}
- Question type: Multiple Choice only
- Difficulty level: ${difficulty || 'medium'}
- Points per question: 2

Return a JSON array of questions in this EXACT format:
[
  {
    "question_type": "multiple_choice",
    "question_text": "What is the primary function of X?",
    "question_order": 1,
    "points": 2,
    "hint": "Think about what X does with Y.",
    "explanation": "The correct answer is A because...",
    "options": [
      {"text": "Correct answer", "is_correct": true},
      {"text": "Plausible distractor 1", "is_correct": false},
      {"text": "Plausible distractor 2", "is_correct": false},
      {"text": "Plausible distractor 3", "is_correct": false}
    ]
  }
]

IMPORTANT: 
- Ensure questions test comprehension from the provided content
- Make sure all questions are directly answerable from the provided content
- Use proper terminology from the content
- For multiple choice, make distractors plausible but clearly wrong
- Return ONLY the JSON array, no other text or markdown formatting`;

    console.log('Calling Lovable AI for quiz question generation...');

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
        temperature: 0.7,
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
      throw new Error('Failed to generate quiz questions');
    }

    const aiData = await aiResponse.json();
    let generatedText = aiData.choices[0].message.content;

    console.log('Raw AI response:', generatedText.substring(0, 200));

    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      generatedText = jsonMatch[1];
    } else {
      // Try to extract JSON array directly
      const arrayMatch = generatedText.match(/\[\s*{[\s\S]*}\s*\]/);
      if (arrayMatch) {
        generatedText = arrayMatch[0];
      }
    }

    // Parse and validate questions
    let questions;
    try {
      questions = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Response text:', generatedText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate questions
    const validQuestions = questions.filter((q: any) => {
      if (!q.question_text || !q.question_type) return false;
      if (q.question_type !== 'multiple_choice') return false;
      if (!q.options || q.options.length !== 4) return false;
      if (!q.options.some((opt: any) => opt.is_correct)) return false;
      return true;
    });

    console.log(`Generated ${questions.length} questions, ${validQuestions.length} valid`);

    if (validQuestions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid questions could be generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add IDs and ensure proper structure
    const formattedQuestions = validQuestions.map((q: any, index: number) => ({
      id: crypto.randomUUID(),
      question_order: index,
      question_type: 'multiple_choice',
      question_text: q.question_text,
      points: q.points || 2,
      hint_text: q.hint || '',
      explanation: q.explanation || '',
      options: q.options.map((opt: any, optIndex: number) => ({
        id: crypto.randomUUID(),
        option_order: optIndex,
        option_text: opt.text,
        is_correct: opt.is_correct
      }))
    }));

    return new Response(
      JSON.stringify({ 
        questions: formattedQuestions,
        metadata: {
          totalGenerated: questions.length,
          validQuestions: validQuestions.length,
          contentWords: totalWords,
          componentsUsed: components?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz-questions:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate quiz questions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
