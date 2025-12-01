import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessBenchmarkRequest {
  classId: string;
  documentUrl: string;
  documentName: string;
  assessmentTitle: string;
  numberOfQuestions: number;
  extractExisting: boolean;
  matchToLessons: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const body: ProcessBenchmarkRequest = await req.json();
    console.log('Processing benchmark document:', body.documentName);

    // Fetch the document from storage
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from('benchmark-documents')
      .download(body.documentUrl);

    if (fileError) throw fileError;

    let extractedText = '';
    const fileName = body.documentName.toLowerCase();

    // Extract text based on file type
    if (fileName.endsWith('.pdf')) {
      console.log('Processing PDF document...');
      const arrayBuffer = await fileData.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + '\n\n';
      }
    } else if (fileName.endsWith('.txt')) {
      console.log('Processing TXT document...');
      extractedText = await fileData.text();
    } else if (fileName.endsWith('.docx')) {
      console.log('Processing DOCX document...');
      // For DOCX, we'll need mammoth or similar - for now, inform user
      throw new Error('DOCX parsing coming soon. Please convert to PDF or TXT for now.');
    } else {
      throw new Error('Unsupported file format');
    }

    console.log('Extracted text length:', extractedText.length);

    if (extractedText.length < 100) {
      throw new Error('Unable to extract sufficient text from document');
    }

    // Fetch lesson content if matching is requested
    let lessonContext = '';
    if (body.matchToLessons) {
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
            content
          )
        `)
        .eq('class_id', body.classId)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      lessonContext = '\n\nAVAILABLE LESSON CONTENT:\n';
      lessons?.forEach((lesson: any) => {
        lessonContext += `\nLesson ID: ${lesson.id}\nTitle: ${lesson.title}\n`;
        if (lesson.description) lessonContext += `Description: ${lesson.description}\n`;
        if (lesson.learning_objectives) lessonContext += `Objectives: ${lesson.learning_objectives}\n`;
      });
    }

    // Prepare AI prompt
    const SYSTEM_PROMPT = `You are an expert at analyzing educational benchmark documents and creating aligned assessments.

Task: ${body.extractExisting ? 'Extract existing questions from the benchmark document and format them properly' : 'Generate new assessment questions aligned with the benchmark standards in the document'}

Requirements:
- Maintain fidelity to original standards mentioned in the document
- Tag each question with relevant standard codes (e.g., "CCSS.MATH.8.EE.A.1")
- Ensure questions assess the described competencies
- Match difficulty to grade-level expectations
${body.matchToLessons ? '- Identify which lesson IDs cover each standard based on the available lesson content' : ''}
- Create ${body.numberOfQuestions} questions total
- Include a mix of question types: multiple choice, true/false, short answer, and essay
- For multiple choice, include 4 options with only one correct
- For true/false, include proper options
- All questions must be pedagogically sound and age-appropriate

Return ONLY a JSON array with this exact structure (no markdown, no explanations):
[
  {
    "questionType": "multiple_choice" | "true_false" | "short_answer" | "essay",
    "questionText": "Clear, specific question text",
    "points": <number>,
    "standardCode": "STANDARD.CODE.HERE",
    "standardDescription": "Brief description of the standard",
    "difficulty": "easy" | "medium" | "hard",
    "matchedLessonIds": ["lesson-uuid-1", "lesson-uuid-2"],
    "options": [
      {"id": "a", "text": "Option A text", "isCorrect": true},
      {"id": "b", "text": "Option B text", "isCorrect": false},
      {"id": "c", "text": "Option C text", "isCorrect": false},
      {"id": "d", "text": "Option D text", "isCorrect": false}
    ],
    "correctAnswer": "For short answer questions",
    "rubric": "For essay and short answer: detailed grading criteria"
  }
]`;

    const USER_PROMPT = `BENCHMARK DOCUMENT CONTENT:
${extractedText.substring(0, 50000)}

${lessonContext}

Create ${body.numberOfQuestions} assessment questions ${body.extractExisting ? 'by extracting and formatting questions from the document' : 'that align with the standards described in the document'}.

Return ONLY the JSON array, no other text.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    console.log('Calling Lovable AI for benchmark processing...');
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
      throw new Error('AI processing failed');
    }

    const aiData = await aiResponse.json();
    let questionsText = aiData.choices[0].message.content;

    // Clean up response
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('AI response received, parsing...');
    
    let questions;
    try {
      questions = JSON.parse(questionsText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', questionsText.substring(0, 500));
      throw new Error('Invalid AI response format');
    }

    if (!Array.isArray(questions)) {
      throw new Error('AI did not return an array of questions');
    }

    console.log('Generated questions from benchmark:', questions.length);

    // Create assessment
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('class_assessments')
      .insert({
        class_id: body.classId,
        title: body.assessmentTitle,
        created_by: user.id,
        benchmark_document_url: body.documentUrl,
        benchmark_document_name: body.documentName,
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
      source_lesson_id: (q.matchedLessonIds && q.matchedLessonIds.length > 0) ? q.matchedLessonIds[0] : null,
      ai_generated: !body.extractExisting,
      from_benchmark: true,
    }));

    const { error: questionsError } = await supabaseClient
      .from('class_assessment_questions')
      .insert(questionInserts);

    if (questionsError) throw questionsError;

    console.log('Assessment created successfully:', assessment.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        assessmentId: assessment.id,
        questionsGenerated: questions.length,
        standardsFound: [...new Set(questions.map((q: any) => q.standardCode).filter(Boolean))].length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-benchmark-document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});