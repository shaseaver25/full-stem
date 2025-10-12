import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test database connection
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (dbError) {
      console.error('Database health check failed:', dbError);
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          latency,
          error: dbError.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Refresh system metrics
    const { error: refreshError } = await supabase.rpc('refresh_system_metrics');
    
    if (refreshError) {
      console.error('Failed to refresh metrics:', refreshError);
    }

    return new Response(
      JSON.stringify({
        status: 'healthy',
        latency,
        timestamp: new Date().toISOString(),
        components: {
          database: 'operational',
          api: 'operational',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
