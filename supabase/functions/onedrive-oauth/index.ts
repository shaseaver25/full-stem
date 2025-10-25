import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { code, state } = await req.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 Exchanging OneDrive authorization code for tokens...');

    // Exchange authorization code for tokens
    const clientId = '8350983d-f94c-4357-8741-e83e576a49dc';
    const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');
    
    // Get origin from referer header to construct the correct redirect URI
    const referer = req.headers.get('referer') || '';
    const origin = referer ? new URL(referer).origin : 'https://6ba0ffd1-9a8e-49f9-9f63-94f86000b68b.lovableproject.com';
    const redirectUri = `${origin}/onedrive/callback`;
    
    console.log('📍 Using redirect URI:', redirectUri);

    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret!,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('❌ Token exchange failed:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to exchange authorization code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokens = await tokenResponse.json();
    console.log('✅ OneDrive tokens obtained');

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Encrypt tokens
    const { data: encryptedAccessToken, error: encryptError1 } = await supabase.rpc(
      'encrypt_token',
      { token: tokens.access_token }
    );

    if (encryptError1) {
      console.error('❌ Access token encryption failed:', encryptError1);
      return new Response(
        JSON.stringify({ error: 'Failed to encrypt access token', details: encryptError1.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: encryptedRefreshToken, error: encryptError2 } = await supabase.rpc(
      'encrypt_token',
      { token: tokens.refresh_token }
    );

    if (encryptError2) {
      console.error('❌ Refresh token encryption failed:', encryptError2);
      return new Response(
        JSON.stringify({ error: 'Failed to encrypt refresh token', details: encryptError2.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Tokens encrypted successfully');

    // Store encrypted tokens
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error: storeError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: user.id,
        provider: 'onedrive',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
      });

    if (storeError) {
      console.error('❌ Failed to store tokens:', storeError);
      return new Response(
        JSON.stringify({ error: 'Failed to store tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ OneDrive tokens stored successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in onedrive-oauth function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
