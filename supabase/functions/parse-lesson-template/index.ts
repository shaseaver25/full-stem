// ✅ Clean parse-lesson-template Edge Function
import { serve as startServer } from "https://deno.land/std@0.168.0/http/server.ts";
import mammoth from "https://esm.sh/mammoth@1.6.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
};

startServer(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const contentType = req.headers.get("content-type") || "";
    console.log("📥 Content-Type:", contentType);

    let text: string;
    let lessonId: string | undefined;

    // Handle binary DOCX upload (from frontend FileReader)
    if (contentType.includes("application/octet-stream")) {
      console.log("📄 Processing binary DOCX file");
      
      const arrayBuffer = await req.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      
      console.log("📊 Buffer size:", buffer.length, "bytes");
      
      // Extract text with Mammoth
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      console.log("✅ Parsed text length:", text.length);
      
    } else {
      // Handle JSON format (base64 or parsed content)
      console.log("📋 Processing JSON request");
      
      const body = await req.json();
      const { base64File, fileType, lessonId: requestLessonId } = body;
      
      lessonId = requestLessonId;

      if (!base64File || fileType !== "docx") {
        return new Response(JSON.stringify({ error: "Missing or invalid file data" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      // Decode base64 DOCX buffer
      const buffer = Uint8Array.from(atob(base64File), (c) => c.charCodeAt(0));
      
      // Extract text with Mammoth
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      console.log("✅ Parsed text length:", text.length);
    }

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
