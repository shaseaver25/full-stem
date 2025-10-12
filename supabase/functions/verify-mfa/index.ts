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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    console.log('MFA verification requested for user:', user.id, 'isBackupCode:', isBackupCode);

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
          error: 'Account temporarily locked. Please try again later.',
          lockedUntil: rateLimit.locked_until,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get MFA settings (decrypt secret if needed)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('mfa_enabled, mfa_backup_codes, mfa_backup_codes_used')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.mfa_enabled) {
      throw new Error('MFA not enabled for this user');
    }

    let isValid = false;

    if (isBackupCode) {
      console.log('Verifying backup code for user:', user.id);
      
      // Hash the provided backup code
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashedToken = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Check if backup code exists and hasn't been used
      const usedCodes = profile.mfa_backup_codes_used || [];
      const backupCodes = profile.mfa_backup_codes || [];
      
      isValid = backupCodes.includes(hashedToken) && !usedCodes.includes(hashedToken);

      if (isValid) {
        // Mark backup code as used
        await supabaseClient
          .from('profiles')
          .update({
            mfa_backup_codes_used: [...usedCodes, hashedToken],
          })
          .eq('id', user.id);
        
        console.log('Backup code used successfully for user:', user.id);
      }
    } else {
      // Decrypt and verify TOTP token
      console.log('Verifying TOTP token for user:', user.id);
      
      const { data: secretData, error: secretError } = await supabaseClient.rpc(
        'decrypt_mfa_secret',
        { uid: user.id }
      );

      if (secretError || !secretData) {
        console.error('Failed to decrypt MFA secret:', secretError);
        throw new Error('Failed to retrieve MFA secret');
      }

      isValid = authenticator.verify({
        token: token,
        secret: secretData,
      });
    }

    if (isValid) {
      console.log('MFA verification successful for user:', user.id);
      
      // Reset rate limit
      await supabaseClient
        .from('mfa_rate_limits')
        .delete()
        .eq('user_id', user.id);

      // Update user's app metadata with MFA verified claim
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        user.id,
        {
          app_metadata: {
            ...user.app_metadata,
            mfa_verified: true,
            mfa_verified_at: new Date().toISOString(),
          }
        }
      );

      if (updateError) {
        console.error('Failed to update user metadata:', updateError);
      }

      // Log successful verification
      await supabaseClient
        .from('mfa_audit_log')
        .insert({
          user_id: user.id,
          action: isBackupCode ? 'mfa_backup_code_used' : 'mfa_verified',
          success: true,
        });

      // Get updated session with new JWT claims
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

      return new Response(
        JSON.stringify({
          verified: true,
          session: sessionData.session,
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
            ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
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
