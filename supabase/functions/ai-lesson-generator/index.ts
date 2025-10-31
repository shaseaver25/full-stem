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

    // Get Lovable API key from Supabase secrets (auto-configured)
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Lovable API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for lesson generation with TailorEDU guidelines
    const systemPrompt = `You are an expert K-12 instructional designer for TailorEDU, creating lessons for ALL learners, including students who struggle with attention and engagement.

CRITICAL REQUIREMENTS:

1. ENGAGEMENT-FIRST DESIGN
- Break content into small, digestible components (5-15 minutes each)
- Each component should be self-contained and completable
- Use visual hooks and interactive elements throughout
- Celebrate progress and completion

2. COMPONENT STRUCTURE
Each section must include:
- Clear title with appropriate context
- Time estimate (realistic, not rushed)
- Engaging hook or question
- Chunked content (max 3-4 paragraphs per step)
- Interactive element (question, activity, reflection)
- Key takeaway
- Media suggestion with [SUGGEST IMAGE/VIDEO/DIAGRAM: "search term"]

3. MEDIA SUGGESTIONS (MANDATORY)
For EVERY section, include in teacherNotes:
- [SUGGEST IMAGE: "specific search term"] with Alt text and Purpose
- [SUGGEST VIDEO: "specific search term"] with Duration
- [SUGGEST DIAGRAM: "specific concept"] for complex topics

4. LESSON FLOW
- Hook/Warm-Up (5 min): Question, scenario, or surprising fact with [SUGGEST IMAGE]
- Direct Instruction (10-20 min): Break into 2-4 steps, one idea each with [SUGGEST DIAGRAM/VIDEO]
- Guided Practice (10-15 min): Hands-on with scaffolding and [SUGGEST VIDEO: "demo"]
- Independent Practice (15-20 min): Assignable, clear success criteria
- Exit Ticket: 2-3 reflection questions

5. ACCESSIBILITY & ENGAGEMENT
- Write at specified reading level
- One main idea per step
- Include "Quick Check!" after every 2-3 steps
- Add "Think About This" reflection prompts
- Suggest "Brain Break!" for lessons over 30 minutes
- Provide differentiation for all learner types

IMPORTANT: Return ONLY valid JSON with NO trailing commas. No markdown code fences.

JSON Structure:
{
  "meta": { "subject", "topic", "gradeLevel", "readingLevel", "language", "durationMinutes", "standards" },
  "objectives": ["Students will be able to..."],
  "vocabulary": ["term: definition (max 10)"],
  "materials": ["Material [SUGGEST IMAGE: 'material photo']"],
  "warmup": { "minutes": 5, "steps": ["Hook question or activity", "[SUGGEST IMAGE: 'hook visual']", "🎯 Quick Check: [question]"] },
  "directInstruction": { "minutes": 15, "steps": ["Clear instruction", "[SUGGEST DIAGRAM: 'concept']", "Key Takeaway: [summary]", "🎯 Quick Check: [question]"] },
  "guidedPractice": { "minutes": 12, "activities": ["Scaffolded activity with steps", "[SUGGEST VIDEO: 'demo']", "Success criteria"] },
  "independentPractice": { "minutes": 15, "choices": ["Assignment description", "Requirements and rubric"] },
  "differentiation": {
    "struggling": ["Specific strategy with visual support"],
    "onLevel": ["Standard expectation"],
    "advanced": ["Extension with research"],
    "englishLearners": ["Language scaffold"],
    "iep": ["Accommodation"]
  },
  "formativeAssessment": { "methods": ["Observable behavior"], "exitTicket": "2-3 reflection questions" },
  "summativeAssessment": { "prompt": "Performance task", "rubric": ["Criterion"] },
  "teacherNotes": [
    "MEDIA FOR WARMUP: [SUGGEST IMAGE: 'search'], Alt: [description], Purpose: [reason]",
    "MEDIA FOR INSTRUCTION: [SUGGEST DIAGRAM: 'concept map'], Purpose: [reason]",
    "MEDIA FOR PRACTICE: [SUGGEST VIDEO: 'tutorial'], Duration: 3-5 min",
    "Engagement: Include progress tracking for each section",
    "Display: Use horizontal progression (one section at a time)"
  ],
  "safetyAndAIUse": ["Safety consideration"]
}

GOLDEN RULE: Make struggling students think "I can do this!" not "This is too much."`;

    const userPrompt = `Create a ${durationMinutes}-minute ${subject} lesson on "${topic}" for grade ${gradeLevel} students at ${readingLevel} reading level in ${language} language.${standards ? `\n\nAlign to these standards: ${JSON.stringify(standards)}` : ''}`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Lovable AI error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Lovable AI response received, tokens used:', data.usage);

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
          provider: 'Lovable AI',
          model: 'google/gemini-2.5-flash',
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
          estimatedCost: 0 // Lovable AI uses workspace credits
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
