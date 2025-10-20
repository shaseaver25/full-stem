import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
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
      subject: `New Demo Request from ${payload.name}`,
      content: `
New demo request received:

Name: ${payload.name}
Email: ${payload.email}
Organization: ${payload.organization || 'Not provided'}
Message: ${payload.message || 'Not provided'}

Submitted at: ${new Date().toLocaleString()}
      `.trim(),
    });

    // Send confirmation email to submitter
    await client.send({
      from: smtpUsername,
      to: payload.email,
      subject: 'Thank you for requesting a TailoredU demo',
      content: `
Hi ${payload.name},

Thank you for your interest in TailoredU! We've received your demo request and will be in touch shortly to schedule a time that works for you.

In the meantime, feel free to explore our platform at https://tailoredu.com

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
