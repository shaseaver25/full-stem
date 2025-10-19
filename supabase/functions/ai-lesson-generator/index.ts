import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// System prompt for lesson generation (from lessonSystem.ts)
const LESSON_SYSTEM_PROMPT = `
You are an expert K-12 instructional designer.
Return ONLY valid JSON that matches the provided TypeScript interface "AILesson".
Do not include markdown code fences or commentary.

Rules:
- Write at the requested grade and reading levels.
- Split total time across warmup, directInstruction, guidedPractice, independentPractice.
- Objectives must be measurable ("Students will be able to ...").
- Include differentiation for struggling, onLevel, and advanced students.
- Include formative assessment with an exit ticket.
- Align to provided standards or infer logical ones.
- Generate original, copyright-safe content.
- Use the requested language code (en/es/fr/de/zh).
- Keep vocabulary concise (≤10 terms).
- Do not exceed 1800 output tokens.
`;

// In-memory rate limiting
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateLessonRequest {
  topic: string;
  subject: string;
  gradeLevel: string;
  readingLevel: string;
  language: string;
  durationMinutes: number;
  standards?: Array<{ framework: string; code: string; description?: string }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Parse and validate request
    const body: GenerateLessonRequest = await req.json();
    const { topic, subject, gradeLevel, readingLevel, language, durationMinutes, standards } = body;

    // Validate required fields
    if (!topic || !subject || !gradeLevel || !readingLevel || !language || !durationMinutes) {
      return new Response(
        JSON.stringify({ error: "Invalid input: missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate duration
    if (durationMinutes > 120 || durationMinutes < 1) {
      return new Response(
        JSON.stringify({ error: "Invalid input: durationMinutes must be between 1 and 120" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Rate limiting
    const now = Date.now();
    const userTimestamps = (rateLimits.get(userId) || []).filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    if (userTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    userTimestamps.push(now);
    rateLimits.set(userId, userTimestamps);

    // Build teacher-friendly prompt
    const standardsText = standards?.length
      ? `Align to the following standards: ${JSON.stringify(standards)}.`
      : "Infer appropriate standards for this topic.";

    const teacherPrompt = `Create a lesson plan for grade ${gradeLevel} ${subject} on the topic "${topic}". Reading level: ${readingLevel}. Language: ${language}. Duration: approximately ${durationMinutes} minutes. ${standardsText} Return JSON only.`;

    console.log(`[AI Lesson Generator] Generating lesson for user ${userId}`);
    console.log(`[AI Lesson Generator] Topic: ${topic}, Subject: ${subject}, Grade: ${gradeLevel}`);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: LESSON_SYSTEM_PROMPT },
          { role: "user", content: teacherPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1800,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("[AI Lesson Generator] OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    let responseText = openaiData.choices?.[0]?.message?.content || "";
    const usage = openaiData.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    console.log(`[AI Lesson Generator] Received response. Usage:`, usage);

    // Parse AI response as JSON
    let lesson;
    try {
      // Clean up potential markdown code fences
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      lesson = JSON.parse(responseText);
    } catch (parseError) {
      console.warn("[AI Lesson Generator] Initial parse failed, retrying with explicit instruction");
      
      // Retry with explicit instruction
      const retryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: LESSON_SYSTEM_PROMPT },
            { role: "user", content: teacherPrompt },
            { role: "assistant", content: responseText },
            { role: "user", content: "Return valid JSON only. Do not include any markdown formatting or explanatory text." },
          ],
          temperature: 0.7,
          max_tokens: 1800,
        }),
      });

      if (!retryResponse.ok) {
        throw new Error("Retry failed: OpenAI API error");
      }

      const retryData = await retryResponse.json();
      const retryText = retryData.choices?.[0]?.message?.content || "";
      const cleanRetryText = retryText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      try {
        lesson = JSON.parse(cleanRetryText);
      } catch (retryParseError) {
        console.error("[AI Lesson Generator] Retry parse failed:", retryParseError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to parse AI response as valid JSON",
            details: retryParseError instanceof Error ? retryParseError.message : "Unknown error"
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Calculate estimated cost (GPT-4o-mini pricing)
    const inputCost = (usage.prompt_tokens / 1_000_000) * 0.150;
    const outputCost = (usage.completion_tokens / 1_000_000) * 0.600;
    const estimatedCost = inputCost + outputCost;

    // Log AI usage to Supabase
    const { error: logError } = await supabase.from("ai_lesson_history").insert({
      user_id: userId,
      model_provider: "openai",
      model_name: "gpt-4o-mini",
      input_tokens: usage.prompt_tokens,
      output_tokens: usage.completion_tokens,
      estimated_cost: estimatedCost,
      prompt_preview: teacherPrompt.substring(0, 500),
      response_preview: responseText.substring(0, 500),
    });

    if (logError) {
      console.error("[AI Lesson Generator] Failed to log usage:", logError);
    }

    console.log(`[AI Lesson Generator] Success. Cost: $${estimatedCost.toFixed(6)}`);

    // Return success response
    return new Response(
      JSON.stringify({
        lesson,
        usage: {
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          estimatedCost,
          provider: "openai",
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[AI Lesson Generator] Error:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
