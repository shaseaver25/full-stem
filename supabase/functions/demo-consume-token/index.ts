import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConsumeTokenBody {
  token: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  console.log('=== Demo Consume Token Function Start ===');
  console.log('Method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const { token }: ConsumeTokenBody = await req.json();
    
    console.log('Request parsed:', { token: token ? `${token.substring(0, 8)}...` : 'null' });

    if (!token) {
      console.log('No token provided');
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Looking up token in database...');
    
    // Find the token and check if it's valid
    const { data: tokenData, error: tokenError } = await supabase
      .from('magic_tokens')
      .select(`
        id,
        token,
        demo_tenant_id,
        expires_at,
        consumed,
        demo_tenants (
          id,
          status,
          expires_at
        )
      `)
      .eq('token', token)
      .eq('consumed', false)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.log('Token not found or error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Token found:', { 
      id: tokenData.id, 
      demo_tenant_id: tokenData.demo_tenant_id,
      expires_at: tokenData.expires_at
    });

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      console.log('Token expired:', { now, expiresAt });
      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if demo tenant exists and is active
    const demoTenant = tokenData.demo_tenants;
    if (!demoTenant || demoTenant.status !== 'active') {
      console.log('Demo tenant not active:', demoTenant);
      return new Response(
        JSON.stringify({ error: 'Demo session is no longer available' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if demo tenant is expired
    const tenantExpiresAt = new Date(demoTenant.expires_at);
    if (now > tenantExpiresAt) {
      console.log('Demo tenant expired:', { now, tenantExpiresAt });
      
      // Update tenant status to expired
      await supabase
        .from('demo_tenants')
        .update({ status: 'expired' })
        .eq('id', demoTenant.id);
      
      return new Response(
        JSON.stringify({ error: 'Demo session has expired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Marking token as consumed...');
    
    // Mark token as consumed
    const { error: updateError } = await supabase
      .from('magic_tokens')
      .update({ consumed: true })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error marking token as consumed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to consume token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Token consumed successfully');
    console.log('=== Demo Consume Token Success ===');

    // Return success response with demo tenant ID
    return new Response(
      JSON.stringify({ 
        success: true,
        demoTenantId: tokenData.demo_tenant_id,
        message: 'Token consumed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});