import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface DemoRequestBody {
  fullName: string;
  workEmail: string;
  role: 'Teacher' | 'District Admin' | 'Other';
  schoolOrDistrict: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

serve(async (req) => {
  console.log('=== Demo Request Function Start ===');
  console.log('Method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing request body...');
    const requestBody: DemoRequestBody = await req.json();
    console.log('Request parsed:', { 
      email: requestBody.workEmail, 
      name: requestBody.fullName,
      role: requestBody.role 
    });

    // Validate required fields
    if (!requestBody.fullName || !requestBody.workEmail || !requestBody.role || !requestBody.schoolOrDistrict) {
      console.error('Missing fields:', {
        fullName: !!requestBody.fullName,
        workEmail: !!requestBody.workEmail,
        role: !!requestBody.role,
        schoolOrDistrict: !!requestBody.schoolOrDistrict
      });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestBody.workEmail)) {
      console.error('Invalid email format:', requestBody.workEmail);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating demo tenant...');
    
    // Create demo tenant
    const { data: newTenant, error: tenantError } = await supabase
      .from('demo_tenants')
      .insert({
        seed_version: 'v1',
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (tenantError) {
      console.error('Tenant creation error:', tenantError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create demo tenant',
          details: tenantError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Demo tenant created:', newTenant.id);

    // Create magic token
    const token = generateToken();
    console.log('Creating magic token...');
    
    const { data: magicToken, error: tokenError } = await supabase
      .from('magic_tokens')
      .insert({
        email: requestBody.workEmail,
        demo_tenant_id: newTenant.id,
        token,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        consumed: false
      })
      .select()
      .single();

    if (tokenError) {
      console.error('Token creation error:', tokenError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create magic token',
          details: tokenError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Magic token created:', token.substring(0, 8) + '...');

    // Create demo user record
    console.log('Creating demo user record...');
    
    const { error: userError } = await supabase
      .from('demo_users')
      .insert({
        email: requestBody.workEmail,
        full_name: requestBody.fullName,
        role: requestBody.role,
        school_or_district: requestBody.schoolOrDistrict,
        demo_tenant_id: newTenant.id
      });

    if (userError) {
      console.warn('Demo user creation warning:', userError);
      // Don't fail the whole request for this
    } else {
      console.log('Demo user record created');
    }

    // Generate demo URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'localhost';
    const demoUrl = `https://${projectId}.lovable.app/demo/start?token=${token}`;

    console.log('Demo URL generated:', demoUrl);

    // Send email with demo link
    console.log('Sending email to:', requestBody.workEmail);
    
    try {
      const emailResponse = await resend.emails.send({
        from: "TailorEDU Demo <demo@resend.dev>",
        to: [requestBody.workEmail],
        subject: "Your TailorEDU Demo Link - Ready Now!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; text-align: center;">Welcome to TailorEDU Demo!</h1>
            
            <p>Hi ${requestBody.fullName},</p>
            
            <p>Thank you for your interest in TailorEDU! Your personalized demo environment is ready.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="margin-top: 0; color: #374151;">🚀 Your Demo Link (Valid for 60 minutes)</h2>
              <a href="${demoUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Your Demo</a>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Or copy this link: ${demoUrl}</p>
            </div>
            
            <h3 style="color: #374151;">What's Included:</h3>
            <ul style="color: #6b7280;">
              <li>✨ AI-powered curriculum for middle school students</li>
              <li>📚 Sample lessons with read-aloud and translation features</li>
              <li>👥 Diverse student personas to explore differentiated learning</li>
              <li>📊 Teacher dashboard with analytics and progress tracking</li>
            </ul>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>Note:</strong> This sandbox uses synthetic data and resets after your session for privacy.</p>
            </div>
            
            <p style="color: #6b7280;">Questions? Reply to this email or visit our website to schedule a live demonstration.</p>
            
            <p>Best regards,<br>
            <strong>The TailorEDU Team</strong></p>
          </div>
        `,
      });

      if (emailResponse.error) {
        console.error('Email send error:', emailResponse.error);
        throw emailResponse.error;
      }

      console.log('Email sent successfully:', emailResponse.data?.id);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the whole request, still return the demo URL
    }

    const response = {
      ok: true,
      message: 'Demo link sent to your email!',
      previewUrl: demoUrl,
      token: token.substring(0, 8) + '...',
      tenantId: newTenant.id
    };

    console.log('=== Demo Request Success ===');

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('=== Demo Request Error ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        type: typeof error
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});