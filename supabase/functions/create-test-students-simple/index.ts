import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STUDENTS = [
  { email: 'MelStudent@test.com', password: 'Test1234!', fullName: 'Mel Student', firstName: 'Mel', lastName: 'Student' },
  { email: 'MichaelStudent@test.com', password: 'Test1234!', fullName: 'Michael Student', firstName: 'Michael', lastName: 'Student' },
  { email: 'KariStudent@test.com', password: 'Test1234!', fullName: 'Kari Student', firstName: 'Kari', lastName: 'Student' },
  { email: 'ManjeetStudent@test.com', password: 'Test1234!', fullName: 'Manjeet Student', firstName: 'Manjeet', lastName: 'Student' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const results = [];

    for (const student of STUDENTS) {
      try {
        // Check if user exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === student.email);

        let userId: string;

        if (existingUser) {
          // Update password if user exists
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: student.password,
            email_confirm: true
          });
          userId = existingUser.id;
          results.push({ email: student.email, status: 'updated' });
        } else {
          // Create new user
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: student.email,
            password: student.password,
            email_confirm: true,
            user_metadata: {
              full_name: student.fullName,
              first_name: student.firstName,
              last_name: student.lastName,
              role: 'student'
            }
          });

          if (userError) throw userError;
          userId = userData.user.id;

          // Create profile
          await supabaseAdmin
            .from('profiles')
            .upsert({
              id: userId,
              email: student.email,
              full_name: student.fullName
            });

          results.push({ email: student.email, status: 'created' });
        }

        // Ensure student profile exists
        const { data: studentProfile } = await supabaseAdmin
          .from('students')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (!studentProfile) {
          await supabaseAdmin
            .from('students')
            .insert({
              user_id: userId,
              first_name: student.firstName,
              last_name: student.lastName
            });
        }

        // Ensure student role exists
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'student'
          }, {
            onConflict: 'user_id,role'
          });

      } catch (error) {
        console.error(`Error processing ${student.email}:`, error);
        results.push({ email: student.email, status: 'error', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test students processed',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating test students:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
