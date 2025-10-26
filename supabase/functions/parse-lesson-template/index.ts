// supabase/functions/parse-lesson-template/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("📄 Parsing lesson template...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const contentType = req.headers.get("content-type") || "";
    let parsedContent = "";
    let lessonId: string | null = null;

    if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      const buffer = await req.arrayBuffer();
      const { value } = await mammoth.extractRawText({ buffer });
      parsedContent = value;
      console.log("✅ Extracted text from DOCX");
    } else {
      const json = await req.json();
      parsedContent = json.parsedContent || "";
      lessonId = json.lessonId || null;
    }

    if (!parsedContent) throw new Error("Template content is empty");

    const lines = parsedContent.split("\n");
    const metadata: any = {
      title: "",
      subject: "",
      grade_level: "",
      duration: 45,
      reading_level: null,
      language_code: "en-US",
      description: "",
    };

    let components: any[] = [];
    let section = "";
    let content = "";
    let inMetadata = false;

    for (const raw of lines) {
      const line = raw.trim();
      if (line === "# Lesson Metadata") {
        inMetadata = true;
        continue;
      }
      if (line === "---") {
        inMetadata = false;
        if (section && content.trim()) {
          components.push({ section, content: content.trim() });
          content = "";
        }
        continue;
      }
      if (inMetadata && line.includes(":")) {
        const [k, ...v] = line.split(":");
        const key = k.toLowerCase();
        const val = v.join(":").trim();
        if (key.includes("title")) metadata.title = val;
        else if (key.includes("subject")) metadata.subject = val;
        else if (key.includes("grade")) metadata.grade_level = val;
        else if (key.includes("duration")) metadata.duration = parseInt(val) || 45;
        else if (key.includes("reading")) metadata.reading_level = parseInt(val);
        else if (key.includes("language")) metadata.language_code = val;
        else if (key.includes("description")) metadata.description = val;
      }
      if (line.startsWith("## Component:")) {
        if (section && content.trim()) {
          components.push({ section, content: content.trim() });
        }
        section = line.replace("## Component:", "").trim();
        content = "";
        continue;
      }
      if (section) content += line + "\n";
    }

    if (section && content.trim()) components.push({ section, content: content.trim() });

    console.log(`✅ Parsed ${components.length} components`);

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    const { data: teacherProfile } = await supabase
      .from("teacher_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!teacherProfile) throw new Error("Teacher profile missing");

    // --- create or update ---
    let finalLessonId = lessonId;

    if (lessonId) {
      const { data, error } = await supabase
        .from("lessons")
        .update({
          title: metadata.title || "Imported Lesson",
          description: metadata.description,
          duration: metadata.duration,
          grade_level: metadata.grade_level,
          subject: metadata.subject,
        })
        .eq("id", lessonId)
        .select()
        .single();

      if (error || !data) {
        console.warn("⚠️ Lesson not found; creating new one.");
        finalLessonId = null;
      } else {
        finalLessonId = data.id;
      }
    }

    if (!finalLessonId) {
      const { data: newLesson, error: insertErr } = await supabase
        .from("lessons")
        .insert({
          teacher_id: teacherProfile.id,
          title: metadata.title || "Imported Lesson",
          description: metadata.description,
          duration: metadata.duration,
          grade_level: metadata.grade_level,
          subject: metadata.subject,
          status: "draft",
        })
        .select()
        .single();
      if (insertErr) throw insertErr;
      finalLessonId = newLesson.id;
    }

    const typeMap: Record<string, string> = {
      instructions: "page",
      page: "page",
      multimedia: "video",
      video: "video",
      "coding ide": "codingEditor",
      activity: "activity",
      discussion: "discussion",
      quiz: "assessment",
      reflection: "page",
      assignment: "assignment",
      resources: "page",
    };

    for (const [i, c] of components.entries()) {
      const type = typeMap[c.section.toLowerCase()] || "page";
      await supabase.from("lesson_components").insert({
        lesson_id: finalLessonId,
        component_type: type,
        title: c.section,
        content: { text: c.content },
        order: i,
        enabled: true,
        is_assignable: type === "assignment",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        lessonId: finalLessonId,
        metadata,
        componentsCreated: components.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("❌ Error parsing lesson template:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
