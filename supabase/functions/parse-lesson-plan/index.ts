import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an AI assistant that parses lesson plans into structured JSON format for an educational platform called TailorEDU.

TASK: Extract information from the provided lesson plan text and return a JSON object with the following structure:

{
  "title": "string",
  "gradeLevel": "string (optional)",
  "description": "string (optional)", 
  "objectives": ["array of learning objectives"],
  "videos": [{"url": "string", "title": "string"}],
  "instructions": "string (optional)",
  "duration": number (in minutes, default 60),
  "desmosEnabled": boolean,
  "desmosType": "calculator" | "geometry",
  "components": [
    {
      "type": "video" | "instructions" | "assignment" | "discussion" | "reflection" | "rubric" | "resources" | "formativeCheck" | "liveDemo",
      "content": {
        // For video: {"url": "string", "title": "string"}
        // For text components: {"html": "string", "text": "string"}
        // For assignments: {"html": "string", "instructions": "string", "rubric": "string (optional)"}
      }
    }
  ]
}

PARSING RULES:
1. Extract the lesson title from "Lesson Title:" field
2. Extract grade level from "Grade Level:" field
3. Look for video URLs in "Video Link:" field
4. Parse "Written Instructions:" into an instructions component
5. Parse "Assignment Instructions:" into an assignment component  
6. Parse "Discussion Prompt:" into a discussion component
7. Parse "Reflection Question:" into a reflection component
8. Parse "Rubric:" into a rubric component
9. Parse "Additional Resources:" into a resources component
10. Parse "Formative Check / Quiz:" into a formativeCheck component
11. Check "Graphing Tool Needed?" for desmosEnabled (Yes = true, No = false)
12. Extract Desmos tool type from "Desmos Tool Type:" field

IMPORTANT:
- Always include both "html" and "text" fields for text components, with the same content
- Extract actual content, don't include field labels
- If a section is empty or not found, don't include that component
- Order components logically: video, instructions, assignment, discussion, reflection, formativeCheck, resources, rubric
- For video components, try to extract a meaningful title if not provided
- Set default duration to 60 minutes if not specified
- Clean up text content - remove extra whitespace and formatting artifacts

Return ONLY the JSON object, no additional text or markdown formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this lesson plan:\n\n${content}` }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please wait a moment and try again.',
            retryAfter: response.headers.get('retry-after') || '60'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key is invalid or missing' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const parsedContent = data.choices[0].message.content;

    try {
      const lessonData = JSON.parse(parsedContent);
      
      // Validate and set defaults
      const validatedLesson = {
        title: lessonData.title || 'Untitled Lesson',
        gradeLevel: lessonData.gradeLevel || '',
        description: lessonData.description || '',
        objectives: Array.isArray(lessonData.objectives) ? lessonData.objectives : [],
        videos: Array.isArray(lessonData.videos) ? lessonData.videos : [],
        instructions: lessonData.instructions || '',
        duration: typeof lessonData.duration === 'number' ? lessonData.duration : 60,
        desmosEnabled: Boolean(lessonData.desmosEnabled),
        desmosType: lessonData.desmosType || 'calculator',
        components: Array.isArray(lessonData.components) ? lessonData.components : [],
      };

      return new Response(
        JSON.stringify(validatedLesson),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse GPT response',
          details: parseError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in parse-lesson-plan function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});