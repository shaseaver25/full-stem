import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // 🔥 Always handle OPTIONS first — no matter what.
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    // ✅ Verify the request is POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    // ✅ Parse incoming JSON body
    const { base64File, fileType, lessonId } = await req.json();

    if (!base64File || fileType !== "docx") {
      return new Response(JSON.stringify({ error: "Missing or invalid file data" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // ✅ Decode base64 DOCX buffer
    const buffer = Uint8Array.from(atob(base64File), (c) => c.charCodeAt(0));

    // ✅ Convert DOCX → plain text using Mammoth
    const { value: text } = await mammoth.extractRawText({ buffer });

    console.log("✅ Parsed text length:", text.length);

    // ✅ Extract simple metadata (this is placeholder logic)
    const metadata = {
      title: text.match(/Title:\s*(.*)/)?.[1] ?? "Untitled Lesson",
      subject: text.match(/Subject:\s*(.*)/)?.[1] ?? "General",
      grade_level: text.match(/Grade Level:\s*(.*)/)?.[1] ?? "N/A",
      duration: text.match(/Duration:\s*(.*)/)?.[1] ?? "Unknown",
    };

    // ✅ Fake component list for now
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
