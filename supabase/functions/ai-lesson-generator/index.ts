import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, subject, gradeLevel, readingLevel, language, durationMinutes, standards } = await req.json();
    
    console.log('Generating AI lesson:', { topic, subject, gradeLevel, readingLevel, language, durationMinutes });

    // Get OpenAI API key from Supabase secrets
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured in Supabase secrets');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please add it in Supabase Dashboard → Project Settings → Edge Functions → Secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for lesson generation
    const systemPrompt = `You are an expert educator creating detailed, standards-aligned lesson plans. Generate a comprehensive lesson plan in JSON format matching the AILesson TypeScript interface.

The lesson should include:
- Clear learning objectives
- Vocabulary terms with definitions
- Required materials
- Warm-up activities (engaging hook)
- Direct instruction steps
- Guided practice activities
- Independent practice choices
- Differentiation strategies for struggling, on-level, advanced learners, English learners, and IEP students
- Formative assessment methods with exit ticket
- Optional summative assessment
- Teacher notes and safety considerations

IMPORTANT: Return ONLY valid JSON with NO trailing commas. Ensure proper JSON syntax.

Return ONLY valid JSON matching this structure:
{
  "meta": { "subject", "topic", "gradeLevel", "readingLevel", "language", "durationMinutes", "standards" },
  "objectives": string[],
  "vocabulary": string[],
  "materials": string[],
  "warmup": { "minutes": number, "steps": string[] },
  "directInstruction": { "minutes": number, "steps": string[] },
  "guidedPractice": { "minutes": number, "activities": string[] },
  "independentPractice": { "minutes": number, "choices": string[] },
  "differentiation": { "struggling": string[], "onLevel": string[], "advanced": string[], "englishLearners": string[], "iep": string[] },
  "formativeAssessment": { "methods": string[], "exitTicket": string },
  "summativeAssessment": { "prompt": string, "rubric": string[] },
  "teacherNotes": string[],
  "safetyAndAIUse": string[]
}`;

    const userPrompt = `Create a ${durationMinutes}-minute ${subject} lesson on "${topic}" for grade ${gradeLevel} students at ${readingLevel} reading level in ${language} language.${standards ? `\n\nAlign to these standards: ${JSON.stringify(standards)}` : ''}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenAI response received, tokens used:', data.usage);

    // Parse the lesson JSON from the response
    const lessonText = data.choices[0].message.content;
    let lesson;
    
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = lessonText.match(/```json\n([\s\S]*?)\n```/) || lessonText.match(/```\n([\s\S]*?)\n```/);
      let jsonString = jsonMatch ? jsonMatch[1] : lessonText;
      
      // Fix common JSON issues: remove trailing commas before closing braces/brackets
      jsonString = jsonString
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .trim();
      
      lesson = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse lesson JSON:', parseError);
      console.error('Raw response:', lessonText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse lesson data from AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        lesson,
        usage: {
          provider: 'OpenAI',
          model: 'gpt-4o-mini',
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
          estimatedCost: (data.usage.prompt_tokens * 0.00015 + data.usage.completion_tokens * 0.0006) / 1000
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-lesson-generator function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
