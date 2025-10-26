import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // ✅ Handle preflight OPTIONS request properly
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

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

    const contentType = req.headers.get("content-type") || "";
    console.log("📄 Received request with content-type:", contentType);

    let parsedText = "";

    // Handle DOCX binary uploads
    if (contentType.includes("application/octet-stream")) {
      console.log("📦 Reading binary DOCX buffer...");
      const uint8Array = new Uint8Array(await req.arrayBuffer());

      console.log("📖 Extracting DOCX text via mammoth...");
      const result = await mammoth.extractRawText({ buffer: uint8Array });
      parsedText = result.value.trim();

      console.log("✅ Extracted DOCX text length:", parsedText.length);
    }
    // Handle JSON uploads (from .txt templates)
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      parsedText = body.parsedContent || "";
      console.log("📝 Received text content:", parsedText.slice(0, 100));
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    if (!parsedText) {
      throw new Error("No lesson content found in file.");
    }

    // Simple parser demo — replace with your real logic
    const components = parsedText
      .split("## Component:")
      .filter((x) => x.trim().length > 0)
      .map((block, index) => ({
        title: block.split("\n")[0].trim(),
        order: index,
        content: block.trim(),
      }));

    console.log(`✅ Parsed ${components.length} components`);

    return new Response(
      JSON.stringify({
        success: true,
        metadata: { title: "Imported Lesson" },
        componentsCreated: components.length,
        components,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error("❌ Error extracting DOCX:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }
});
