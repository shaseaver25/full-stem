import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import mammoth from "npm:mammoth";

serve(async (req) => {
  try {
    console.log("🧠 parse-lesson-template invoked");

    const contentType = req.headers.get("content-type") || "";

    let textContent = "";

    if (contentType.includes("application/octet-stream")) {
      // Binary DOCX upload
      console.log("📄 Parsing DOCX file");
      const arrayBuffer = await req.arrayBuffer();
      const docxBuffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      textContent = result.value.trim();
    } else if (contentType.includes("application/json")) {
      // Fallback for text-based upload
      console.log("📝 Parsing JSON body");
      const body = await req.json();
      textContent = body.parsedContent || "";
    } else {
      throw new Error("Unsupported content type");
    }

    if (!textContent) {
      console.error("❌ No text extracted from file");
      return new Response(
        JSON.stringify({ error: "Failed to read document" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Text extracted successfully");

    // TODO: parse lesson components here (e.g., split by ## Component:)
    const components = textContent.split("## Component:").length - 1;

    return new Response(
      JSON.stringify({
        message: "Lesson parsed successfully",
        components,
        preview: textContent.slice(0, 200),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Error in parse-lesson-template:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});

    console.log("👤 Authenticated user:", user.email);

    // Read and parse .docx file
    const body = await req.arrayBuffer();
    let text = "";
    try {
      const result = await mammoth.extractRawText({ buffer: body });
      text = result.value || "";
      if (!text.trim()) throw new Error("No text extracted from .docx file");
    } catch (err) {
      console.error("❌ Error extracting DOCX:", err);
      return new Response(JSON.stringify({ error: "Failed to read document" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Parse template
    const metadata: Record<string, string> = {};
    const components: { type: string; content: string }[] = [];
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

    // ✅ Get or create teacher profile
    let { data: teacherProfile, error: teacherError } = await supabase
      .from("teacher_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (teacherError || !teacherProfile) {
      console.log("⚠️ No teacher profile found — creating one automatically...");
      const { data: newProfile, error: createError } = await supabase
        .from("teacher_profiles")
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email,
          email: user.email,
        })
        .select("id")
        .single();
      if (createError) throw createError;
      teacherProfile = newProfile;
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
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("🔥 Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
