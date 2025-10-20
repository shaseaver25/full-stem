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

    // Fetch progress data
    const { data: progressData } = await supabaseClient
      .from("lesson_progress")
      .select("*")
      .eq("student_id", studentId);

    // Fetch assignment grades
    const { data: gradesData } = await supabaseClient
      .from("assignment_submissions")
      .select(`
        *,
        assignment:class_assignments_new(title)
      `)
      .eq("user_id", student.user_id);

    // Prepare data summary for AI
    const completionRate = progressData ? 
      (progressData.filter((p: any) => p.completed).length / progressData.length * 100).toFixed(1) : 
      0;

    const averageGrade = gradesData && gradesData.length > 0 ?
      (gradesData.reduce((sum: number, g: any) => sum + (g.grade || 0), 0) / gradesData.length).toFixed(1) :
      "N/A";

    const systemPrompt = `You are an educational AI assistant analyzing student performance data. 
Generate 2-3 concise, actionable insights about the student's learning patterns and needs.
Focus on: learning preferences, strengths, areas for improvement, and recommended teaching strategies.
Keep each insight to 1-2 sentences.`;

    const userPrompt = `Student Profile:
- Reading Level: ${student.reading_level || "Not specified"}
- Learning Style: ${student.learning_style || "Not specified"}
- IEP Accommodations: ${student.iep_accommodations?.join(", ") || "None"}
- Interests: ${student.interests?.join(", ") || "Not specified"}
- Language Preference: ${student.language_preference || "English"}

Performance Data:
- Lesson Completion Rate: ${completionRate}%
- Number of lessons tracked: ${progressData?.length || 0}
- Average Assignment Grade: ${averageGrade}
- Number of assignments submitted: ${gradesData?.length || 0}

Generate personalized learning insights for this student.`;

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
      throw new Error("Failed to generate insights");
    }

    const aiResponse = await response.json();
    const insights = aiResponse.choices?.[0]?.message?.content || "No insights generated";

    // Store in feedback history
    await supabaseClient
      .from("ai_feedback_history")
      .insert({
        student_id: studentId,
        feedback_text: insights,
        feedback_type: "insight",
      });

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-insights function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});