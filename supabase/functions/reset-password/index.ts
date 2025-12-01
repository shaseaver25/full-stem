import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { Resend } from 'npm:resend@2.0.0';

interface PasswordResetRequest {
  userId: string;
  email: string;
  method: 'email' | 'temporary' | 'custom';
  customPassword?: string;
  forceChange?: boolean;
  notifyUser?: boolean;
}

// Generate a secure random password
function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    const resetData: PasswordResetRequest = await req.json();
    
    console.log('Password reset requested:', {
      userId: resetData.userId,
      method: resetData.method,
      email: resetData.email
    });

    let temporaryPassword: string | undefined;
    let resetLink: string | undefined;

    if (resetData.method === 'email') {
      // Method 1: Send password reset email
      // Get the origin from the request or use production URL
      const origin = req.headers.get('origin') || 'https://full-stem.lovable.app';
      const redirectUrl = `${origin}/reset-password`;
      
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: resetData.email,
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Failed to generate reset link:', error);
        throw new Error(`Failed to generate reset link: ${error.message}`);
      }

      resetLink = data.properties?.action_link;
      
      // Actually send the email using Resend
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      
      try {
        const emailResponse = await resend.emails.send({
          from: 'Full STEM <onboarding@resend.dev>',
          to: [resetData.email],
          subject: 'Reset Your Password',
          html: `
            <h1>Password Reset Request</h1>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetLink}</p>
            <p>This link will expire in 60 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The Full STEM Team</p>
          `,
        });
        
        console.log('Password reset email sent successfully:', emailResponse);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        throw new Error(`Failed to send email: ${emailError.message}`);
      }
      
      console.log('Password reset email sent to:', resetData.email);

    } else if (resetData.method === 'temporary') {
      // Method 2: Generate temporary password
      temporaryPassword = generateSecurePassword(12);

      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        resetData.userId,
        {
          password: temporaryPassword
        }
      );

      if (error) {
        console.error('Failed to set temporary password:', error);
        throw new Error(`Failed to set temporary password: ${error.message}`);
      }

      // Set metadata to force password change
      await supabaseAdmin
        .from('profiles')
        .update({
          // Note: You'll need to add this column if it doesn't exist
          // force_password_change: true,
          // temp_password_expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          updated_at: new Date().toISOString()
        })
        .eq('id', resetData.userId);

      console.log('Temporary password generated for user:', resetData.userId);

    } else if (resetData.method === 'custom' && resetData.customPassword) {
      // Method 3: Set custom password
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        resetData.userId,
        {
          password: resetData.customPassword
        }
      );

      if (error) {
        console.error('Failed to set custom password:', error);
        throw new Error(`Failed to set custom password: ${error.message}`);
      }

      // Optionally force password change on next login
      if (resetData.forceChange) {
        await supabaseAdmin
          .from('profiles')
          .update({
            // Note: You'll need to add this column if it doesn't exist
            // force_password_change: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', resetData.userId);
      }

      console.log('Custom password set for user:', resetData.userId);
    }

    // Log the password reset action
    await supabaseAdmin
      .from('activity_log')
      .insert({
        user_id: resetData.userId,
        action: 'password_reset',
        details: {
          method: resetData.method,
          reset_by: 'developer',
          timestamp: new Date().toISOString()
        }
      });

    // Optionally send notification email for temporary/custom passwords
    if (resetData.notifyUser && resetData.method !== 'email' && temporaryPassword) {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      
      try {
        await resend.emails.send({
          from: 'Full STEM <onboarding@resend.dev>',
          to: [resetData.email],
          subject: 'Your Temporary Password',
          html: `
            <h1>Password Reset</h1>
            <p>Hello,</p>
            <p>Your password has been reset by an administrator. Here is your temporary password:</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <code style="font-size: 16px; font-weight: bold;">${temporaryPassword}</code>
            </div>
            <p>Please log in using this temporary password and change it immediately for security.</p>
            <p>Best regards,<br>The Full STEM Team</p>
          `,
        });
        console.log('Temporary password notification sent to:', resetData.email);
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't throw here - password was already reset successfully
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset successful',
        temporaryPassword: temporaryPassword,
        resetLink: resetLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to reset password'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
