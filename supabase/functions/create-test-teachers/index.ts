import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEACHERS = [
  { email: 'MelTeacher@test.com', password: 'Test1234!', fullName: 'Mel Teacher' },
  { email: 'MichaelTeacher@test.com', password: 'Test1234!', fullName: 'Michael Teacher' },
  { email: 'KariTeacher@test.com', password: 'Test1234!', fullName: 'Kari Teacher' },
  { email: 'ManjeetTeacher@test.com', password: 'Test1234!', fullName: 'Manjeet Teacher' },
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

    for (const teacher of TEACHERS) {
      try {
        // Check if user exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === teacher.email);

        let userId: string;

        if (existingUser) {
          // Update password if user exists
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: teacher.password,
            email_confirm: true
          });
          userId = existingUser.id;
          results.push({ email: teacher.email, status: 'updated' });
        } else {
          // Create new user
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: teacher.email,
            password: teacher.password,
            email_confirm: true,
            user_metadata: {
              full_name: teacher.fullName
            }
          });

          if (userError) throw userError;
          userId = userData.user.id;

          // Create profile
          await supabaseAdmin
            .from('profiles')
            .upsert({
              id: userId,
              email: teacher.email,
              full_name: teacher.fullName
            });

          results.push({ email: teacher.email, status: 'created' });
        }

        // Ensure teacher role exists
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'teacher'
          }, {
            onConflict: 'user_id,role'
          });

        // Ensure teacher profile exists
        const { data: teacherProfile } = await supabaseAdmin
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (!teacherProfile) {
          await supabaseAdmin
            .from('teacher_profiles')
            .insert({
              user_id: userId,
              onboarding_completed: true
            });
        }

      } catch (error) {
        console.error(`Error processing ${teacher.email}:`, error);
        results.push({ email: teacher.email, status: 'error', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test teachers processed',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating test teachers:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
