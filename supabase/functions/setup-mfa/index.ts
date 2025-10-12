import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticator } from "https://esm.sh/otplib@12.0.1";
import QRCode from "https://esm.sh/qrcode@1.5.3";

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

    const { action, token, secret } = await req.json();

    if (action === 'generate') {
      // Generate a new secret
      const newSecret = authenticator.generateSecret();
      
      // Generate QR code
      const otpauth = authenticator.keyuri(
        user.email || user.id,
        'TailorEDU',
        newSecret
      );
      
      const qrCode = await QRCode.toDataURL(otpauth);

      return new Response(
        JSON.stringify({
          secret: newSecret,
          qrCode: qrCode,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'verify') {
      // Verify the token
      const isValid = authenticator.verify({
        token: token,
        secret: secret,
      });

      if (isValid) {
        // Generate backup codes
        const backupCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );

        // Hash backup codes before storing
        const hashedCodes = backupCodes.map(code => 
          crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
            .then(hash => Array.from(new Uint8Array(hash))
              .map(b => b.toString(16).padStart(2, '0'))
              .join(''))
        );

        const hashedCodesResolved = await Promise.all(hashedCodes);

        // Update user profile with MFA secret and backup codes
        const { error } = await supabaseClient
          .from('profiles')
          .update({
            mfa_enabled: true,
            mfa_secret: secret,
            mfa_backup_codes: hashedCodesResolved,
          })
          .eq('id', user.id);

        if (error) throw error;

        // Log MFA verification attempt
        await supabaseClient
          .from('mfa_verification_attempts')
          .insert({
            user_id: user.id,
            success: true,
          });

        return new Response(
          JSON.stringify({
            verified: true,
            backupCodes: backupCodes,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        // Log failed attempt
        await supabaseClient
          .from('mfa_verification_attempts')
          .insert({
            user_id: user.id,
            success: false,
          });

        return new Response(
          JSON.stringify({
            verified: false,
            error: 'Invalid verification code',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in setup-mfa function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
