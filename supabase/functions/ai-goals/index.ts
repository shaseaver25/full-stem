import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId } = await req.json();

    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch student data
    const { data: student, error: studentError } = await supabaseClient
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentError) throw studentError;

    // Fetch recent progress and grades
    const { data: progressData } = await supabaseClient
      .from("lesson_progress")
      .select("*")
      .eq("student_id", studentId)
      .order("updated_at", { ascending: false })
      .limit(10);

    const { data: recentGoals } = await supabaseClient
      .from("student_goals")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch recent AI insights
    const { data: recentInsights } = await supabaseClient
      .from("ai_feedback_history")
      .select("*")
      .eq("student_id", studentId)
      .eq("feedback_type", "insight")
      .order("created_at", { ascending: false })
      .limit(3);

    const completedGoals = recentGoals?.filter(g => g.status === "completed").length || 0;
    const activeGoals = recentGoals?.filter(g => g.status === "active").length || 0;

    const systemPrompt = `You are an educational AI assistant helping create personalized learning goals.
Generate 3-4 SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals for this student.
Goals should be realistic, achievable within 1-2 weeks, and tailored to the student's needs.
Format: Return each goal on a new line, numbered 1-4.`;

    const userPrompt = `Student Profile:
- Reading Level: ${student.reading_level || "Not specified"}
- Learning Style: ${student.learning_style || "Not specified"}
- IEP Accommodations: ${student.iep_accommodations?.join(", ") || "None"}
- Interests: ${student.interests?.join(", ") || "Not specified"}

Recent Performance:
- Completed ${completedGoals} goals recently
- Currently has ${activeGoals} active goals
- Recent lessons tracked: ${progressData?.length || 0}

${recentInsights?.length ? `Recent AI Insights:\n${recentInsights.map(i => `- ${i.feedback_text}`).join('\n')}` : ''}

Generate personalized weekly learning goals.`;

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
      throw new Error("Failed to generate goals");
    }

    const aiResponse = await response.json();
    const goalsText = aiResponse.choices?.[0]?.message?.content || "";

    // Parse goals from numbered list
    const goalsList = goalsText
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(goal => goal.length > 0);

    // Store as feedback
    await supabaseClient
      .from("ai_feedback_history")
      .insert({
        student_id: studentId,
        feedback_text: goalsText,
        feedback_type: "goal_suggestion",
      });

    return new Response(
      JSON.stringify({ goals: goalsList, rawText: goalsText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-goals function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});