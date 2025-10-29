import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, gradeLevel, learningObjectives, duration } = await req.json();
    
    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert educator and instructional designer. Generate comprehensive, engaging lesson components that are pedagogically sound and accessible to all learners.

Create lessons that include:
- Clear learning objectives aligned with standards
- Engaging introduction/hook
- Step-by-step activities
- Assessment questions
- Differentiation strategies
- Real-world connections

Format the lesson as structured JSON with these components:
{
  "title": "Lesson title",
  "introduction": "Engaging hook and context",
  "objectives": ["Specific learning objective 1", "Specific learning objective 2"],
  "mainContent": "Detailed lesson content with examples",
  "activities": [
    {"title": "Activity name", "description": "Activity details", "duration": "15 min"}
  ],
  "assessmentQuestions": [
    {"question": "Assessment question", "type": "multiple-choice|open-ended", "options": ["A", "B", "C", "D"]}
  ],
  "differentiation": {
    "support": "Strategies for struggling learners",
    "extension": "Enrichment for advanced learners"
  },
  "materials": ["Material 1", "Material 2"],
  "closure": "Lesson wrap-up and reflection"
}`;

    const userPrompt = `Generate a ${duration || '45-minute'} lesson plan for ${gradeLevel || 'middle school'} students on the topic: "${topic}".

${learningObjectives ? `Focus on these learning objectives:\n${learningObjectives}` : ''}

Create an engaging, accessible lesson that includes differentiation strategies and real-world connections.`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Try to parse as JSON, fallback to text if it fails
    let lessonPlan;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : generatedText;
      lessonPlan = JSON.parse(jsonText);
    } catch {
      // If parsing fails, return as structured text
      lessonPlan = {
        title: topic,
        content: generatedText,
        rawText: true
      };
    }

    return new Response(
      JSON.stringify({ lessonPlan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-lesson function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
