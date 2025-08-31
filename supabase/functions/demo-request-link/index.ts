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

    // For now, just return success without sending email
    const response = {
      ok: true,
      message: 'Demo link created successfully!',
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