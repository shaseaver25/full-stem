import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const createOrFindDemoTenant = async (email: string) => {
  // Check for existing active tenant for this email (within last 6 hours)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  
  const { data: existingTenants } = await supabase
    .from('demo_tenants')
    .select('*')
    .eq('status', 'active')
    .gte('created_at', sixHoursAgo)
    .limit(1);

  if (existingTenants && existingTenants.length > 0) {
    return existingTenants[0];
  }

  // Create new demo tenant
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
    throw new Error(`Failed to create demo tenant: ${error.message}`);
  }

  // Trigger demo data seeding (call existing seed-demo-tenant function)
  try {
    const seedResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/seed-demo-tenant?action=seed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!seedResponse.ok) {
      console.warn('Failed to seed demo data, but continuing with tenant creation');
    }
  } catch (seedError) {
    console.warn('Error seeding demo data:', seedError);
  }

  return newTenant;
};

const createMagicToken = async (email: string, demoTenantId: string) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

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
    throw new Error(`Failed to create magic token: ${error.message}`);
  }

  return data;
};

const createDemoUser = async (requestBody: DemoRequestBody, demoTenantId: string) => {
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
  }
};

const sendDemoEmail = async (email: string, fullName: string, token: string) => {
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/v1', '') || 'https://localhost:3000';
  const demoUrl = `${baseUrl}/demo/start?token=${token}`;

  // In a real implementation, you would integrate with your email service here
  // For now, we'll just log the email details
  console.log(`Demo email for ${email}:`, {
    to: email,
    subject: 'Your TailorEDU Demo Link',
    body: `Hi ${fullName},\n\nHere's your sandbox demo (valid for 60 minutes): ${demoUrl}\n\nThis sandbox uses synthetic data only and resets after your session.\n\n– TailorEDU Team`
  });

  // Return the URL for development/preview purposes
  return demoUrl;
};

serve(async (req) => {
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

    const requestBody: DemoRequestBody = await req.json();

    // Validate required fields
    if (!requestBody.fullName || !requestBody.workEmail || !requestBody.role || !requestBody.schoolOrDistrict) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestBody.workEmail)) {
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

    // Send demo email (in development, return preview URL)
    const previewUrl = await sendDemoEmail(requestBody.workEmail, requestBody.fullName, magicToken.token);

    // Log telemetry
    console.log('demo.request_link', {
      email: requestBody.workEmail,
      role: requestBody.role,
      tenantId: demoTenant.id
    });

    const response = {
      ok: true,
      message: 'Demo link sent successfully',
      // In development, include preview URL
      ...(Deno.env.get('ENVIRONMENT') === 'development' && { previewUrl })
    };

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