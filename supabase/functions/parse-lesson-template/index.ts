// ✅ Simplified parse-lesson-template Edge Function
// DOCX parsing is now done on the frontend with mammoth.js
import { serve as startServer } from "https://deno.land/std@0.168.0/http/server.ts";

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

    console.log("📋 Processing parsed lesson content");
    
    const body = await req.json();
    const text = body.parsedContent || '';
    const lessonId = body.lessonId;
    
    console.log("✅ Received text length:", text.length);
    
    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "No content provided" }), {
        status: 400,
        headers: corsHeaders,
      });
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
