import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { code, origin } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Authorization code is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("🔐 Exchanging OneDrive authorization code for tokens...");

    // Exchange authorization code for tokens
    const clientId = "8350983d-f94c-4357-8741-e83e576a49dc";
    const clientSecret = Deno.env.get("AZURE_CLIENT_SECRET");

    if (!clientSecret) {
      console.error("❌ AZURE_CLIENT_SECRET not configured");
      return new Response(JSON.stringify({ error: "Server configuration error: missing client secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use origin from request body (sent from frontend)
    const redirectUri = `${origin}/onedrive/callback`;

    console.log("🔁 Using redirect URI:", redirectUri);
    console.log("🔑 Using client ID:", clientId);

    const tokenResponse = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ Token exchange failed:", errorText);

      let errorDetail = "Failed to exchange authorization code";
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.error_description || errorJson.error || errorDetail;
      } catch (e) {
        // If not JSON, use the text
        errorDetail = errorText.substring(0, 200);
      }

      return new Response(
        JSON.stringify({
          error: "Failed to exchange authorization code",
          details: errorDetail,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tokens = await tokenResponse.json();
    console.log("✅ OneDrive tokens obtained");

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("❌ User authentication failed:", userError);
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ User authenticated:", user.id);

    // Encrypt tokens using the database function
    const { data: encryptedAccessToken, error: encryptAccessError } = await supabase.rpc("encrypt_token", {
      token_text: tokens.access_token,
    });

    if (encryptAccessError) {
      console.error("❌ Failed to encrypt access token:", encryptAccessError);
      return new Response(JSON.stringify({ error: "Failed to encrypt tokens" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: encryptedRefreshToken, error: encryptRefreshError } = await supabase.rpc("encrypt_token", {
      token_text: tokens.refresh_token,
    });

    if (encryptRefreshError) {
      console.error("❌ Failed to encrypt refresh token:", encryptRefreshError);
      return new Response(JSON.stringify({ error: "Failed to encrypt tokens" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store encrypted tokens
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error: storeError } = await supabase.from("user_tokens").upsert(
      {
        user_id: user.id,
        provider: "onedrive",
        access_token_enc: encryptedAccessToken,
        refresh_token_enc: encryptedRefreshToken,
        expires_at: expiresAt,
      },
      {
        onConflict: "user_id,provider",
      },
    );

    if (storeError) {
      console.error("❌ Failed to store tokens:", storeError);
      return new Response(JSON.stringify({ error: "Failed to store tokens", details: storeError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ OneDrive tokens stored successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in onedrive-oauth function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
