import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { provider, session } = await req.json();

    if (!provider || !session) {
      throw new Error('Missing provider or session data');
    }

    // Extract OAuth tokens from session
    const { provider_token, provider_refresh_token, expires_at } = session;

    if (!provider_token) {
      console.log('No provider token found in session');
      return new Response(
        JSON.stringify({ message: 'No OAuth token to store' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Encrypt and store tokens
    const { data: encryptedAccess, error: encryptError1 } = await supabase.rpc(
      'encrypt_token',
      { token_text: provider_token }
    );

    if (encryptError1) {
      throw new Error(`Failed to encrypt access token: ${encryptError1.message}`);
    }

    let encryptedRefresh = null;
    if (provider_refresh_token) {
      const { data, error: encryptError2 } = await supabase.rpc(
        'encrypt_token',
        { token_text: provider_refresh_token }
      );
      if (encryptError2) {
        throw new Error(`Failed to encrypt refresh token: ${encryptError2.message}`);
      }
      encryptedRefresh = data;
    }

    // Store tokens in database
    const { error: insertError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: user.id,
        provider: provider,
        access_token_enc: encryptedAccess,
        refresh_token_enc: encryptedRefresh,
        expires_at: expires_at ? new Date(expires_at * 1000).toISOString() : null,
        scope: 'https://www.googleapis.com/auth/drive.file',
      }, {
        onConflict: 'user_id,provider'
      });

    if (insertError) {
      throw new Error(`Failed to store tokens: ${insertError.message}`);
    }

    console.log(`Successfully stored OAuth tokens for user ${user.id}, provider ${provider}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OAuth tokens stored successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error storing OAuth tokens:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
