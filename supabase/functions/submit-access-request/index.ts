import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

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

    // Setup SMTP client
    const smtpHost = 'smtp-mail.outlook.com';
    const smtpPort = 587;
    const smtpUsername = Deno.env.get('MAIL_USER');
    const smtpPassword = Deno.env.get('MAIL_PASSWORD');
    const mailTo = Deno.env.get('MAIL_TO') || smtpUsername;

    if (!smtpUsername || !smtpPassword) {
      throw new Error('SMTP credentials not configured');
    }

    const client = new SmtpClient();
    await client.connectTLS({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUsername,
      password: smtpPassword,
    });

    // Send notification email to admin
    await client.send({
      from: smtpUsername,
      to: mailTo!,
      subject: `New Access Request from ${payload.email}`,
      content: `
New access request received:

Email: ${payload.email}
Role: ${payload.role || 'Not provided'}

Submitted at: ${new Date().toLocaleString()}
      `.trim(),
    });

    // Send confirmation email to submitter
    await client.send({
      from: smtpUsername,
      to: payload.email,
      subject: "You're on the list! - TailoredU",
      content: `
Hi there,

Thank you for your interest in TailoredU! You're now on our waitlist for early access.

We'll be in touch soon with updates about your access and next steps.

In the meantime, learn more about TailoredU at https://tailoredu.com

Best regards,
The TailoredU Team
      `.trim(),
    });

    await client.close();
    console.log('Emails sent successfully');

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
