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
      { email: 'MelStudent@test.com', firstName: 'Mel' },
      { email: 'MichaelStudent@test.com', firstName: 'Michael' },
      { email: 'KariStudent@test.com', firstName: 'Kari' },
      { email: 'ManjeetStudent@test.com', firstName: 'Manjeet' }
    ];

    const classId = 'ce17fd87-11bc-4342-a8e2-097844a755f7'; // Richfield Excel Certification
    const results = [];

    for (const student of testStudents) {
      // Get user ID
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      if (userError) {
        console.error(`Error fetching users:`, userError);
        continue;
      }

      const user = users.users.find(u => u.email === student.email);
      if (!user) {
        results.push({ email: student.email, status: 'user_not_found' });
        continue;
      }

      // Check if student profile exists
      const { data: existingStudent } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let studentId = existingStudent?.id;

      // Create student profile if it doesn't exist
      if (!studentId) {
        const { data: newStudent, error: studentError } = await supabaseAdmin
          .from('students')
          .insert({
            user_id: user.id,
            first_name: student.firstName,
            last_name: 'Student',
            grade_level: '9-12'
          })
          .select('id')
          .single();

        if (studentError) {
          console.error(`Error creating student profile for ${student.email}:`, studentError);
          results.push({ email: student.email, status: 'profile_creation_failed', error: studentError.message });
          continue;
        }

        studentId = newStudent.id;
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabaseAdmin
        .from('class_students')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .single();

      if (!existingEnrollment) {
        // Enroll in class
        const { error: enrollError } = await supabaseAdmin
          .from('class_students')
          .insert({
            student_id: studentId,
            class_id: classId,
            status: 'active'
          });

        if (enrollError) {
          console.error(`Error enrolling ${student.email}:`, enrollError);
          results.push({ email: student.email, status: 'enrollment_failed', error: enrollError.message });
          continue;
        }
      }

      results.push({ email: student.email, status: 'success', studentId });
    }

    return new Response(
      JSON.stringify({ 
        message: 'Test students processed',
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
