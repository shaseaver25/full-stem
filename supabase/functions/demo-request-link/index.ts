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

const createDemoTenant = async () => {
  console.log('Creating new demo tenant');
  
  try {
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
    return newTenant;
  } catch (err) {
    console.error('Exception in createDemoTenant:', err);
    throw err;
  }
};

const createMagicToken = async (email: string, demoTenantId: string) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  console.log('Creating magic token for:', email);

  try {
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
  } catch (err) {
    console.error('Exception in createMagicToken:', err);
    throw err;
  }
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

  console.log(`Demo email for ${email}:`, {
    to: email,
    subject: 'Your TailorEDU Demo Link',
    body: `Hi ${fullName},\n\nHere's your sandbox demo (valid for 60 minutes): ${demoUrl}\n\nThis sandbox uses synthetic data only and resets after your session.\n\n– TailorEDU Team`
  });

  return demoUrl;
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

    console.log('Parsing request body');
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

    // Create new demo tenant
    const demoTenant = await createDemoTenant();
    console.log(`Using demo tenant: ${demoTenant.id}`);

    // Create magic token
    const magicToken = await createMagicToken(requestBody.workEmail, demoTenant.id);
    console.log(`Created magic token: ${magicToken.token.substring(0, 8)}...`);

    // Create demo user record
    await createDemoUser(requestBody, demoTenant.id);

    // Generate demo URL
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
      // Include preview URL for development
      previewUrl
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