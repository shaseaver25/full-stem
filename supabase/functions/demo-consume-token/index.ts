import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ConsumeTokenBody {
  token: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

    const { token }: ConsumeTokenBody = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Attempting to consume token: ${token.substring(0, 8)}...`);

    // Find and validate the magic token
    const { data: magicToken, error: tokenError } = await supabase
      .from('magic_tokens')
      .select(`
        *,
        demo_tenants (
          id,
          status,
          expires_at
        )
      `)
      .eq('token', token)
      .eq('consumed', false)
      .single();

    if (tokenError || !magicToken) {
      console.log('Token not found or already consumed');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token has expired
    const now = new Date();
    const tokenExpiry = new Date(magicToken.expires_at);
    if (now > tokenExpiry) {
      console.log('Token has expired');
      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if demo tenant is still active
    const demoTenant = magicToken.demo_tenants;
    if (!demoTenant || demoTenant.status !== 'active') {
      console.log('Demo tenant is not active');
      return new Response(
        JSON.stringify({ error: 'Demo session is no longer available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if demo tenant has expired
    const tenantExpiry = new Date(demoTenant.expires_at);
    if (now > tenantExpiry) {
      console.log('Demo tenant has expired');
      
      // Update tenant status to expired
      await supabase
        .from('demo_tenants')
        .update({ status: 'expired' })
        .eq('id', demoTenant.id);
      
      return new Response(
        JSON.stringify({ error: 'Demo session has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark token as consumed
    const { error: updateError } = await supabase
      .from('magic_tokens')
      .update({ consumed: true })
      .eq('id', magicToken.id);

    if (updateError) {
      console.error('Failed to mark token as consumed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to process token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Token consumed successfully');

    // Log telemetry
    console.log('demo.token_consumed', {
      email: magicToken.email,
      tenantId: demoTenant.id
    });

    const response = {
      ok: true,
      demoTenantId: demoTenant.id,
      message: 'Demo session started successfully'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in demo-consume-token:', error);
    
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