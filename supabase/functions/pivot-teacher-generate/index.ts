import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, lessonId, ideaNumber, customRequest, suggestions } = await req.json();
    
    console.log('🎓 Teacher Pivot Request:', { action, lessonId, ideaNumber, hasSuggestions: !!suggestions });
    
    // Get lesson data and components
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('title, objectives')
      .eq('id', lessonId)
      .single();
    
    if (lessonError) throw lessonError;
    
    const { data: components, error: componentsError } = await supabase
      .from('lesson_components')
      .select('component_type, content')
      .eq('lesson_id', lessonId)
      .order('order');
    
    if (componentsError) throw componentsError;
    
    // Build lesson context
    const lessonContext = `
LESSON TITLE: ${lesson.title}

LEARNING OBJECTIVES:
${lesson.objectives?.map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n')}

EXISTING COMPONENTS:
${components?.map((comp: any, i: number) => {
  const rawType = String(comp.component_type || '').toUpperCase();
  const content = comp.content || {};
  const candidateTitle =
    content.title ||
    content.prompt ||
    content.question_text ||
    content.quizData?.title;
  const displayTitle = candidateTitle
    ? String(candidateTitle).slice(0, 80)
    : '(no title)';
  return `${i + 1}. ${rawType}: ${displayTitle}`;
}).join('\n') || 'No components yet'}

AVAILABLE COMPONENT TYPES:
- Page: Text-based content with rich formatting
- Poll/Survey: Quick opinion gathering or formative checks
- Discussion: Threaded conversation prompts
- Quiz/Assessment: Multiple choice, short answer, or mixed questions
- Flashcards: Spaced repetition vocabulary/concept cards
- Activity: Hands-on task with instructions
- Reflection: Metacognitive journaling prompt
- Slides: Presentation-style content
- Video: Embedded video with discussion questions
- Coding Editor: Interactive code practice
- Assignment: Formal work to submit
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'suggest') {
      // Generate 2 component ideas
      systemPrompt = `You are an expert instructional designer helping teachers enhance their lessons. Based on the lesson context, suggest TWO high-value components that:
1. Complement existing content (don't duplicate)
2. Support the learning objectives
3. Engage students at different cognitive levels
4. Fill gaps in the lesson flow (warmup, practice, assessment, reflection, etc.)

Format your response as:
**Idea 1: [Component Type] - [Brief Title]**
[2-3 sentence explanation of how this supports learning objectives and fits the lesson flow]

**Idea 2: [Component Type] - [Brief Title]**
[2-3 sentence explanation]`;

      userPrompt = customRequest || `Based on this lesson context, suggest two complementary components:\n\n${lessonContext}`;
    } else if (action === 'generate') {
      // Generate full component content
      systemPrompt = `You are an expert instructional designer. Generate complete, ready-to-use content for the requested lesson component. Make it:
1. Aligned with learning objectives
2. Engaging and interactive
3. Age/grade appropriate
4. Clear and actionable
5. Complete with all necessary details

Return ONLY valid JSON matching this structure (no markdown, no code blocks):
{
  "component_type": "string",
  "title": "string",
  "content": {
    // Component-specific fields
  }
}

Component type guidelines:
- reflection: { prompt: "string", guidance: "string", examples: ["string"] }
- activity: { instructions: "string", materials: ["string"], steps: ["string"], duration: number }
- quiz: { questions: [{ question: "string", type: "multiple_choice", options: ["string"], correct: number, explanation: "string" }] }
- discussion: { prompt: "string", guiding_questions: ["string"] }
- page: { sections: [{ heading: "string", content: "string" }] }
- poll: { question: "string", options: ["string"], allowMultiple: boolean }
- flashcards: { cards: [{ front: "string", back: "string" }] }`;

      if (customRequest) {
        userPrompt = `Generate a component based on this request: ${customRequest}\n\nLesson context:\n${lessonContext}`;
      } else if (suggestions) {
        userPrompt = `You previously suggested these two ideas:\n\n${suggestions}\n\nNow generate the COMPLETE content for Idea ${ideaNumber}. Make sure the component_type matches what was suggested (e.g., if Idea ${ideaNumber} was a Quiz/Assessment, use component_type "quiz").\n\nLesson context:\n${lessonContext}`;
      } else {
        userPrompt = `Generate the component for Idea ${ideaNumber} based on this lesson context:\n\n${lessonContext}`;
      }
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: action === 'suggest' ? 500 : 2000
      })
    });
    
    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await aiResponse.text();
      console.error('❌ AI Gateway Error:', aiResponse.status, errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }
    
    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;
    
    console.log('✅ Got AI response');
    
    if (action === 'generate') {
      // Parse JSON response for component generation
      try {
        // Remove markdown code blocks if present
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/```\n?/g, '');
        }
        
        const componentData = JSON.parse(cleanResponse);
        
        return new Response(
          JSON.stringify({
            success: true,
            action: 'generate',
            component: componentData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        console.error('Raw response:', response);
        throw new Error('Failed to parse component data from AI response');
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        action: 'suggest',
        suggestions: response
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('💥 Teacher Pivot error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
