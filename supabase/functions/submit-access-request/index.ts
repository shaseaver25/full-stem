import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AccessRequest {
  email: string;
  role?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AccessRequest = await req.json();
    console.log('Access request received:', { email: payload.email });

    // Basic validation
    if (!payload.email) {
      throw new Error('Email is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into database
    const { data: dbData, error: dbError } = await supabase
      .from('access_requests')
      .insert({
        email: payload.email,
        role: payload.role || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save access request: ${dbError.message}`);
    }

    console.log('Access request saved to database:', dbData.id);

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);
    const adminEmail = Deno.env.get('MAIL_TO') || Deno.env.get('MAIL_USER');

    if (!adminEmail) {
      throw new Error('Admin email not configured');
    }

    // Send notification email to admin
    const { error: adminEmailError } = await resend.emails.send({
      from: 'TailoredU <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `New Access Request from ${payload.email}`,
      html: `
        <h2>New Access Request</h2>
        <p><strong>Email:</strong> ${payload.email}</p>
        <p><strong>Role:</strong> ${payload.role || 'Not provided'}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    if (adminEmailError) {
      console.error('Failed to send admin email:', adminEmailError);
    } else {
      console.log('Admin notification email sent');
    }

    // Send confirmation email to submitter
    const { error: confirmEmailError } = await resend.emails.send({
      from: 'TailoredU <onboarding@resend.dev>',
      to: [payload.email],
      subject: "You're on the list! - TailoredU",
      html: `
        <h2>Thank you for your interest!</h2>
        <p>Thank you for your interest in TailoredU! You're now on our waitlist for early access.</p>
        <p>We'll be in touch soon with updates about your access and next steps.</p>
        <p>In the meantime, learn more about TailoredU at <a href="https://tailoredu.com">tailoredu.com</a></p>
        <p>Best regards,<br>The TailoredU Team</p>
      `,
    });

    if (confirmEmailError) {
      console.error('Failed to send confirmation email:', confirmEmailError);
    } else {
      console.log('Confirmation email sent');
    }

    return new Response(
      JSON.stringify({ success: true, id: dbData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in submit-access-request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});