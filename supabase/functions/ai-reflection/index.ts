import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId, goalId } = await req.json();

    if (!studentId || !goalId) {
      throw new Error("Student ID and Goal ID are required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch goal and student data
    const { data: goal, error: goalError } = await supabaseClient
      .from("student_goals")
      .select("*")
      .eq("id", goalId)
      .single();

    if (goalError) throw goalError;

    const { data: student, error: studentError } = await supabaseClient
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentError) throw studentError;

    // Fetch student reflections for this goal
    const { data: reflections } = await supabaseClient
      .from("student_reflections")
      .select("*")
      .eq("goal_id", goalId)
      .order("created_at", { ascending: true });

    if (!reflections || reflections.length === 0) {
      return new Response(
        JSON.stringify({ feedback: "No student reflections available yet for this goal." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an educational AI assistant analyzing student self-reflections on completed learning goals.
Provide constructive, encouraging feedback that:
1. Acknowledges the student's self-awareness and effort
2. Identifies patterns in their learning strengths and challenges
3. Suggests specific next steps or areas to focus on
4. Encourages a growth mindset

Keep feedback concise (3-4 sentences) and actionable.`;

    const reflectionsText = reflections
      .map(r => `Q: ${r.prompt_question}\nA: ${r.reflection_text}`)
      .join('\n\n');

    const userPrompt = `Goal Completed: "${goal.goal_text}"

Student Profile:
- Reading Level: ${student.reading_level || "Not specified"}
- Learning Style: ${student.learning_style || "Not specified"}
- Interests: ${student.interests?.join(", ") || "Not specified"}

Student's Reflections:
${reflectionsText}

Generate adaptive feedback and suggest next steps for the teacher.`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate reflection feedback");
    }

    const aiResponse = await response.json();
    const feedback = aiResponse.choices?.[0]?.message?.content || "No feedback generated";

    // Store feedback
    await supabaseClient
      .from("ai_feedback_history")
      .insert({
        student_id: studentId,
        goal_id: goalId,
        feedback_text: feedback,
        feedback_type: "reflection_summary",
      });

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-reflection function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});