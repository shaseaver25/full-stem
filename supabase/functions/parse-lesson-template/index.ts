// supabase/functions/parse-lesson-template/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("📄 Parsing lesson template...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const contentType = req.headers.get("content-type") || "";
    let parsedContent = "";
    let lessonId: string | null = null;

    // Handle DOCX files
    if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      console.log("📦 Processing base64 .docx...");
      const buffer = await req.arrayBuffer();
      const { value } = await mammoth.extractRawText({ buffer });
      parsedContent = value;
      console.log("✅ Extracted text from base64 .docx:", parsedContent.slice(0, 150));
    } else {
      const jsonBody = await req.json();
      parsedContent = jsonBody.parsedContent || "";
      lessonId = jsonBody.lessonId || null;
    }

    if (!parsedContent) throw new Error("No content found in request");

    console.log("📋 Splitting template lines...");
    const lines = parsedContent.split("\n");

    // --- Parse metadata ---
    const metadata: any = {
      title: "",
      subject: "",
      grade_level: "",
      duration: null,
      reading_level: null,
      language_code: "en-US",
      description: ""
    };

    let currentSection = "";
    let currentContent = "";
    const components: any[] = [];
    let inMetadata = false;

    for (const raw of lines) {
      const line = raw.trim();

      if (line === "# Lesson Metadata") {
        inMetadata = true;
        continue;
      }
      if (line === "---") {
        inMetadata = false;
        if (currentSection && currentContent.trim()) {
          components.push({ section: currentSection, content: currentContent.trim() });
          currentContent = "";
        }
        continue;
      }

      if (inMetadata && line.includes(":")) {
        const [key, ...val] = line.split(":");
        const value = val.join(":").trim();
        const lower = key.toLowerCase();

        if (!value.startsWith("[") && value) {
          if (lower.includes("title")) metadata.title = value;
          else if (lower.includes("subject")) metadata.subject = value;
          else if (lower.includes("grade")) metadata.grade_level = value;
          else if (lower.includes("duration")) metadata.duration = parseInt(value) || 45;
          else if (lower.includes("reading")) metadata.reading_level = parseInt(value) || null;
          else if (lower.includes("language")) metadata.language_code = value;
          else if (lower.includes("description")) metadata.description = value;
        }
      }

      if (line.startsWith("## Component:")) {
        if (currentSection && currentContent.trim()) {
          components.push({ section: currentSection, content: currentContent.trim() });
        }
        currentSection = line.replace("## Component:", "").trim();
        currentContent = "";
        continue;
      }

      if (currentSection) currentContent += line + "\n";
    }

    if (currentSection && currentContent.trim()) {
      components.push({ section: currentSection, content: currentContent.trim() });
    }

    console.log("✅ Parsed metadata:", metadata);
    console.log("✅ Found components:", components.length);

    // --- Auth ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("User not authenticated");

    const { data: teacherProfile, error: teacherError } = await supabase
      .from("teacher_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (teacherError || !teacherProfile) throw new Error("Teacher profile not found");

    // --- Create or update lesson ---
    let finalLessonId = lessonId;
    let lessonRecord = null;

    if (lessonId) {
      const { data, error } = await supabase
        .from("lessons")
        .update({
          title: metadata.title || "Imported Lesson",
          description: metadata.description || "",
          duration: metadata.duration || 45,
          grade_level: metadata.grade_level || "",
          subject: metadata.subject || "",
          updated_at: new Date().toISOString()
        })
        .eq("id", lessonId)
        .select()
        .single();

      if (error || !data) {
        console.warn("⚠️ Lesson not found, creating new one...");
        finalLessonId = null;
      } else {
        lessonRecord = data;
      }
    }

    if (!finalLessonId) {
      const { data: newLesson, error: createError } = await supabase
        .from("lessons")
        .insert({
          teacher_id: teacherProfile.id,
          title: metadata.title || "Imported Lesson",
          description: metadata.description || "",
          duration: metadata.duration || 45,
          grade_level: metadata.grade_level || "",
          subject: metadata.subject || "",
          status: "draft"
        })
        .select()
        .single();

      if (createError) throw createError;
      finalLessonId = newLesson.id;
      lessonRecord = newLesson;
      console.log("✅ Created new lesson:", finalLessonId);
    }

    // --- Component type mapping ---
    const typeMap: Record<string, string> = {
      "instructions": "page",
      "page": "page",
      "multimedia": "video",
      "video": "video",
      "coding ide": "codingEditor",
      "activity": "activity",
      "discussion": "discussion",
      "quiz": "assessment",
      "reflection": "page",
      "assignment": "assignment",
      "resources": "page"
    };

    cons
