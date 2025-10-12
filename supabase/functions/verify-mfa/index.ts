import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticator } from "https://esm.sh/otplib@12.0.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { token, isBackupCode } = await req.json();

    // Get user's MFA settings
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('mfa_secret, mfa_backup_codes')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to retrieve MFA settings');
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      const hashedToken = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(token)
      );
      const hashedTokenHex = Array.from(new Uint8Array(hashedToken))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const backupCodes = profile.mfa_backup_codes || [];
      const codeIndex = backupCodes.indexOf(hashedTokenHex);
      
      if (codeIndex !== -1) {
        isValid = true;
        
        // Remove used backup code
        const updatedCodes = backupCodes.filter((_, index) => index !== codeIndex);
        await supabaseClient
          .from('profiles')
          .update({ mfa_backup_codes: updatedCodes })
          .eq('id', user.id);
      }
    } else {
      // Verify TOTP token
      isValid = authenticator.verify({
        token: token,
        secret: profile.mfa_secret,
      });
    }

    // Log verification attempt
    await supabaseClient
      .from('mfa_verification_attempts')
      .insert({
        user_id: user.id,
        success: isValid,
      });

    return new Response(
      JSON.stringify({
        verified: isValid,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in verify-mfa function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
