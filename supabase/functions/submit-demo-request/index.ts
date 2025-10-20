import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoRequest {
  name: string;
  email: string;
  organization?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: DemoRequest = await req.json();
    console.log('Demo request received:', { email: payload.email, name: payload.name });

    // Basic validation
    if (!payload.name || !payload.email) {
      throw new Error('Name and email are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into database
    const { data: dbData, error: dbError } = await supabase
      .from('demo_requests')
      .insert({
        name: payload.name,
        email: payload.email,
        organization: payload.organization || null,
        message: payload.message || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save demo request: ${dbError.message}`);
    }

    console.log('Demo request saved to database:', dbData.id);

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
      subject: `New Demo Request from ${payload.name}`,
      html: `
        <h2>New Demo Request</h2>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        <p><strong>Organization:</strong> ${payload.organization || 'Not provided'}</p>
        <p><strong>Message:</strong> ${payload.message || 'Not provided'}</p>
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
      subject: 'Thank you for requesting a TailoredU demo',
      html: `
        <h2>Thank you for your interest!</h2>
        <p>Hi ${payload.name},</p>
        <p>Thank you for your interest in TailoredU! We've received your demo request and will be in touch shortly to schedule a time that works for you.</p>
        <p>In the meantime, feel free to explore our platform at <a href="https://tailoredu.com">tailoredu.com</a></p>
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
    console.error('Error in submit-demo-request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});