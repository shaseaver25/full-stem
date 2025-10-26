// functions/parse-lesson-template/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ✅ Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 🔐 Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("🚫 Missing Authorization header");
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
      console.error("🚫 Invalid user session:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log("👤 Authenticated user:", user.email);

    // 🧠 Read uploaded DOCX file
    const body = await req.arrayBuffer();
    console.log("📄 Processing uploaded DOCX...");
    const { value: text } = await mammoth.extractRawText({ buffer: body });
    console.log("✅ Extracted text length:", text.length);

    // 🔍 Parse metadata and components
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
    console.log("🧠 Metadata parsed:", metadata);

    // 🧑‍🏫 Create Lesson Record
    let finalLessonId = null;

    try {
      const { data: teacherProfile, error: teacherError } = await supabase
        .from("teacher_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (teacherError || !teacherProfile) throw new Error("No teacher profile found");

      const insertPayload = {
        teacher_id: teacherProfile.id,
        title: metadata.title || "Imported Lesson",
        description: metadata.description || "",
        duration: metadata.duration || 45,
        grade_level: metadata.grade_level || "",
        subject: metadata.subject || "",
        status: "draft",
      };

      console.log("🪄 Inserting lesson:", insertPayload);

      const { data: newLesson, error: insertErr } = await supabase
        .from("lessons")
        .insert(insertPayload)
        .select("id")
        .maybeSingle();

      if (insertErr) {
        console.error("❌ Lesson insert error:", insertErr);
        throw insertErr;
      }

      finalLessonId = newLesson?.id;
      console.log("✅ Created new lesson:", finalLessonId);
    } catch (err) {
      console.error("❌ Error creating lesson:", err);
      throw err;
    }

    // 🧩 Insert Components
    for (const component of components) {
      try {
        const payload = {
          lesson_id: finalLessonId,
          type: component.type,
          content: component.content,
          position: components.indexOf(component),
        };
        const { error: compErr } = await supabase.from("lesson_components").insert(payload);
        if (compErr) console.error("⚠️ Component insert failed:", compErr);
      } catch (compErr) {
        console.error("❌ Component insert error:", compErr);
      }
    }

    console.log("🎉 Lesson import completed");
    return new Response(
      JSON.stringify({
        success: true,
        lesson_id: finalLessonId,
        metadata,
        components_count: components.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error("🔥 Fatal Error in parse-lesson-template:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
