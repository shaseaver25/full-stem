import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

const createOrFindDemoTenant = async (email: string) => {
  // Check for existing active tenant (within last 6 hours)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  
  console.log('Checking for existing demo tenants...');
  
  const { data: existingTenants, error: queryError } = await supabase
    .from('demo_tenants')
    .select('*')
    .eq('status', 'active')
    .gte('created_at', sixHoursAgo)
    .limit(1);

  if (queryError) {
    console.error('Error querying demo_tenants:', queryError);
  }

  if (existingTenants && existingTenants.length > 0) {
    console.log('Found existing demo tenant:', existingTenants[0].id);
    return existingTenants[0];
  }

  // Create new demo tenant
  console.log('Creating new demo tenant...');
  
  const { data: newTenant, error } = await supabase
    .from('demo_tenants')
    .insert({
      seed_version: 'v1',
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating demo tenant:', error);
    throw new Error(`Failed to create demo tenant: ${error.message}`);
  }

  console.log('Demo tenant created:', newTenant.id);

  // Trigger demo data seeding
  try {
    const { data: seedResult, error: seedError } = await supabase.functions.invoke('seed-demo-tenant', {
      body: { action: 'seed' }
    });
    
    if (seedError) {
      console.warn('Failed to seed demo data:', seedError);
    } else {
      console.log('Demo data seeded successfully');
    }
  } catch (seedError) {
    console.warn('Error seeding demo data:', seedError);
  }

  return newTenant;
};

const createMagicToken = async (email: string, demoTenantId: string) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  console.log('Creating magic token for:', email);

  const { data, error } = await supabase
    .from('magic_tokens')
    .insert({
      email,
      demo_tenant_id: demoTenantId,
      token,
      expires_at: expiresAt,
      consumed: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating magic token:', error);
    throw new Error(`Failed to create magic token: ${error.message}`);
  }

  console.log('Magic token created successfully');
  return data;
};

const createDemoUser = async (requestBody: DemoRequestBody, demoTenantId: string) => {
  try {
    const { error } = await supabase
      .from('demo_users')
      .insert({
        email: requestBody.workEmail,
        full_name: requestBody.fullName,
        role: requestBody.role,
        school_or_district: requestBody.schoolOrDistrict,
        demo_tenant_id: demoTenantId
      });

    if (error) {
      console.warn('Failed to create demo user record:', error);
    } else {
      console.log('Demo user record created successfully');
    }
  } catch (err) {
    console.warn('Exception in createDemoUser:', err);
  }
};

const sendDemoEmail = async (email: string, fullName: string, token: string) => {
  // Extract project ID from Supabase URL for Lovable domain
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'localhost';
  const demoUrl = `https://${projectId}.lovable.app/demo/start?token=${token}`;

  console.log('Sending demo email to:', email);

  try {
    const emailResponse = await resend.emails.send({
      from: "TailorEDU Demo <demo@resend.dev>",
      to: [email],
      subject: "Your TailorEDU Demo Link - Ready in 60 Minutes!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Welcome to TailorEDU Demo!</h1>
          
          <p>Hi ${fullName},</p>
          
          <p>Thank you for your interest in TailorEDU! Your personalized demo environment is ready.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #374151;">🚀 Your Demo Link (Valid for 60 minutes)</h2>
            <a href="${demoUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Your Demo</a>
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
      throw emailResponse.error;
    }

    console.log('Email sent successfully:', emailResponse.data?.id);
    return demoUrl;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

serve(async (req) => {
  console.log('Demo request link function called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing request body...');
    const requestBody: DemoRequestBody = await req.json();
    console.log('Request body parsed:', { email: requestBody.workEmail, role: requestBody.role });

    // Validate required fields
    if (!requestBody.fullName || !requestBody.workEmail || !requestBody.role || !requestBody.schoolOrDistrict) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestBody.workEmail)) {
      console.error('Invalid email format');
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing demo request for: ${requestBody.workEmail}`);

    // Create or find demo tenant
    const demoTenant = await createOrFindDemoTenant(requestBody.workEmail);
    console.log(`Using demo tenant: ${demoTenant.id}`);

    // Create magic token
    const magicToken = await createMagicToken(requestBody.workEmail, demoTenant.id);
    console.log(`Created magic token: ${magicToken.token.substring(0, 8)}...`);

    // Create demo user record
    await createDemoUser(requestBody, demoTenant.id);

    // Send demo email
    const demoUrl = await sendDemoEmail(requestBody.workEmail, requestBody.fullName, magicToken.token);

    // Log telemetry
    console.log('demo.request_link', {
      email: requestBody.workEmail,
      role: requestBody.role,
      tenantId: demoTenant.id
    });

    const response = {
      ok: true,
      message: 'Demo link sent successfully! Check your email.',
      // Include preview URL for development
      previewUrl: demoUrl
    };

    console.log('Demo request processed successfully');

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in demo-request-link:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});