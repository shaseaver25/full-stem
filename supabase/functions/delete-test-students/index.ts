import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const testStudents = [
      'MelStudent@test.com',
      'MichaelStudent@test.com',
      'KariStudent@test.com',
      'ManjeetStudent@test.com'
    ];

    const results = [];

    for (const email of testStudents) {
      // Get user by email
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error(`Error listing users:`, listError);
        results.push({ email, status: 'list_failed', error: listError.message });
        continue;
      }

      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        results.push({ email, status: 'user_not_found' });
        continue;
      }

      // Delete student profile and enrollments (will cascade)
      const { error: studentError } = await supabaseAdmin
        .from('students')
        .delete()
        .eq('user_id', user.id);

      if (studentError) {
        console.error(`Error deleting student profile for ${email}:`, studentError);
      }

      // Delete auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`Error deleting user ${email}:`, deleteError);
        results.push({ email, status: 'delete_failed', error: deleteError.message });
        continue;
      }

      results.push({ email, status: 'deleted' });
    }

    return new Response(
      JSON.stringify({ 
        message: 'Test students deletion processed',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
