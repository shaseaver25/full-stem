// ✅ parse-lesson-template/index.ts
import { serve as startServer } from "https://deno.land/std@0.168.0/http/server.ts";
import mammoth from "https://esm.sh/mammoth@1.6.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
};

startServer(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    // Preflight CORS check
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const { base64File, fileType, lessonId } = await req.json();

    if (!base64File || fileType !== "docx") {
      return new Response(JSON.stringify({ error: "Missing or invalid file data" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Decode base64 DOCX buffer
    const buffer = Uint8Array.from(atob(base64File), (c) => c.charCodeAt(0));

    // Extract text with Mammoth
    const { value: text } = await mammoth.extractRawText({ buffer });

    console.log("✅ Parsed text length:", text.length);

    // Extract metadata (simple placeholder parsing)
    const metadata = {
      title: text.match(/Title:\s*(.*)/)?.[1] ?? "Untitled Lesson",
      subject: text.match(/Subject:\s*(.*)/)?.[1] ?? "General",
      grade_level: text.match(/Grade Level:\s*(.*)/)?.[1] ?? "N/A",
      duration: text.match(/Duration:\s*(.*)/)?.[1] ?? "Unknown",
    };

    const components = [
      { type: "intro", title: "Introduction" },
      { type: "activity", title: "Main Lesson" },
      { type: "reflection", title: "Wrap-Up" },
    ];

    const responseBody = {
      success: true,
      metadata,
      componentsCreated: components.length,
      components,
      lessonId: lessonId ?? crypto.randomUUID(),
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    return new Response(JSON.stringify({ error: error.message ?? "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
