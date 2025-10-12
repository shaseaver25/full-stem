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
      console.log('Generating MFA secret for user:', user.id);
      
      // Generate a new secret
      const newSecret = authenticator.generateSecret();
      
      // Generate QR code
      const otpauth = authenticator.keyuri(
        user.email || user.id,
        'TailorEDU',
        newSecret
      );
      
      const qrCode = await QRCode.toDataURL(otpauth);

      // Log MFA generation
      await supabaseClient
        .from('mfa_audit_log')
        .insert({
          user_id: user.id,
          action: 'mfa_secret_generated',
          success: true,
        });

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
      console.log('Verifying MFA token for user:', user.id);
      
      // Check rate limiting
      const { data: rateLimit } = await supabaseClient
        .from('mfa_rate_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (rateLimit?.locked_until && new Date(rateLimit.locked_until) > new Date()) {
        console.warn('User account locked due to too many attempts:', user.id);
        await supabaseClient
          .from('mfa_audit_log')
          .insert({
            user_id: user.id,
            action: 'mfa_verification_blocked',
            success: false,
          });

        return new Response(
          JSON.stringify({
            verified: false,
            error: 'Account temporarily locked due to too many failed attempts. Please try again later.',
            lockedUntil: rateLimit.locked_until,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify the token
      const isValid = authenticator.verify({
        token: token,
        secret: secret,
      });

      if (isValid) {
        console.log('MFA token verified successfully for user:', user.id);
        
        // Generate backup codes
        const backupCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );

        // Hash backup codes before storing
        const hashedCodes = await Promise.all(
          backupCodes.map(async (code) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(code);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
          })
        );

        // Use the encrypt function to store the secret securely
        const { error: encryptError } = await supabaseClient.rpc(
          'encrypt_mfa_secret',
          { uid: user.id, secret_text: secret }
        );

        if (encryptError) {
          console.error('Failed to encrypt MFA secret:', encryptError);
          throw new Error('Failed to store MFA secret securely');
        }

        // Update user profile with MFA enabled and backup codes
        const { error } = await supabaseClient
          .from('profiles')
          .update({
            mfa_enabled: true,
            mfa_backup_codes: hashedCodes,
            mfa_backup_codes_used: [],
          })
          .eq('id', user.id);

        if (error) throw error;

        // Reset rate limit on successful verification
        await supabaseClient
          .from('mfa_rate_limits')
          .delete()
          .eq('user_id', user.id);

        // Log successful verification
        await supabaseClient
          .from('mfa_audit_log')
          .insert({
            user_id: user.id,
            action: 'mfa_enabled',
            success: true,
          });

        console.log('MFA setup completed for user:', user.id);

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
        console.warn('Invalid MFA verification attempt for user:', user.id);
        
        // Update rate limit
        const newAttemptCount = (rateLimit?.attempt_count || 0) + 1;
        const shouldLock = newAttemptCount >= 5;
        
        await supabaseClient
          .from('mfa_rate_limits')
          .upsert({
            user_id: user.id,
            attempt_count: newAttemptCount,
            locked_until: shouldLock 
              ? new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
              : null,
          });

        // Log failed attempt
        await supabaseClient
          .from('mfa_audit_log')
          .insert({
            user_id: user.id,
            action: 'mfa_verification_failed',
            success: false,
          });

        return new Response(
          JSON.stringify({
            verified: false,
            error: 'Invalid verification code',
            attemptsRemaining: Math.max(0, 5 - newAttemptCount),
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
