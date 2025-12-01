import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    // Parse request body
    let body;
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { classId, teacherProfileId } = body;

    if (!classId || !teacherProfileId) {
      return new Response(
        JSON.stringify({ error: 'Missing classId or teacherProfileId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Adding teacher to class:', { classId, teacherProfileId });

    // Get current user for added_by field
    const { data: { user } } = await supabaseAdmin.auth.getUser();

    // Add teacher to the class_teachers junction table (allows multiple teachers)
    const { data: classTeacherData, error: classTeacherError } = await supabaseAdmin
      .from('class_teachers')
      .insert({
        class_id: classId,
        teacher_id: teacherProfileId,
        role: 'co-teacher',
        added_by: user?.id,
      })
      .select()
      .single();

    if (classTeacherError) {
      // If already exists, just return success
      if (classTeacherError.code === '23505') {
        console.log('Teacher already assigned to this class');
        
        // Fetch the class data to return
        const { data: classData, error: fetchError } = await supabaseAdmin
          .from('classes')
          .select('*')
          .eq('id', classId)
          .single();

        if (fetchError) {
          return new Response(
            JSON.stringify({ error: fetchError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: classData, message: 'Teacher already assigned' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Error adding teacher to class:', classTeacherError);
      return new Response(
        JSON.stringify({ error: classTeacherError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the class data to return
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) {
      console.error('Error fetching class data:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully added teacher to class:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
