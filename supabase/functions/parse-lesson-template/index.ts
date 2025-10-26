import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ✅ Full CORS setup
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ✅ Initialize Supabase
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // ✅ Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user session" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log("👤 Authenticated user:", user.email);

    // ✅ Parse .docx
    const body = await req.arrayBuffer();
    const { value: text } = await mammoth.extractRawText({ buffer: body });
    console.log("📄 Extracted text length:", text.length);

    // ✅ Parse metadata & components
    const metadata: Record<string, any> = {};
    const components: any[] = [];
    const lines = text.split("\n").map((l) => l.trim());

    let currentSection = "";
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith("##")) {
        if (currentSection) {
          components.push({
            type: currentSection,
            content: currentContent.join("\n").trim(),
          });
        }
        currentSection = line.replace(/^##/, "").trim();
        currentContent = [];
      } else if (line.includes(":") && !currentSection) {
        const [key, value] = line.split(":").map((x) => x.trim());
        metadata[key.toLowerCase()] = value;
      } else {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      components.push({
        type: currentSection,
        content: currentContent.join("\n").trim(),
      });
    }

    console.log("🧩 Found components:", components.length);

    // ✅ Get teacher profile
    const { data: teacherProfile, error: teacherError } = await supabase
      .from("teacher_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (teacherError || !teacherProfile) {
      throw new Error("No teacher profile found for this user");
    }

    // ✅ Create new lesson
    const { data: newLesson, error: insertErr } = await supabase
      .from("lessons")
      .insert({
        teacher_id: teacherProfile.id,
        title: metadata.title || "Imported Lesson",
        description: metadata.description || "",
        duration: metadata.duration || 45,
        grade_level: metadata.grade_level || "",
        subject: metadata.subject || "",
        status: "draft",
      })
      .select("id")
      .maybeSingle();

    if (insertErr) throw insertErr;
    const lessonId = newLesson?.id;
    console.log("✅ Created new lesson:", lessonId);

    // ✅ Insert lesson components
    for (const [i, comp] of components.entries()) {
      await supabase.from("lesson_components").insert({
        lesson_id: lessonId,
        type: comp.type,
        content: comp.content,
        order: i,
      });
    }

    console.log("🎉 Lesson import complete");

    return new Response(
      JSON.stringify({
        success: true,
        lessonId,
        componentsCreated: components.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("🔥 Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
