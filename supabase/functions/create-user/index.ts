import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'student' | 'admin' | 'developer';
  password: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  sendWelcomeEmail: boolean;
  
  // Student-specific
  gradeLevel?: string;
  studentId?: string;
  classIds?: string[];
  
  // Teacher-specific
  district?: string;
  gradeLevelsTaught?: string[];
  subjectAreas?: string[];
  licenseNumber?: string;
  
  // Admin-specific
  adminType?: 'district' | 'school' | 'super';
  organization?: string;
}

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

    const userData: CreateUserRequest = await req.json();

    // Use provided password
    const password = userData.password;
    
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: userData.email,
        full_name: `${userData.firstName} ${userData.lastName}`
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: userData.role
      });

    if (roleError) {
      console.error('Role error:', roleError);
      throw new Error(`Failed to assign role: ${roleError.message}`);
    }

    // Role-specific setup
    if (userData.role === 'student') {
      // Create student record
      const { data: studentData, error: studentError } = await supabaseAdmin
        .from('students')
        .insert({
          user_id: userId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          grade_level: userData.gradeLevel,
          student_id: userData.studentId
        })
        .select('id')
        .single();

      if (studentError) {
        console.error('Student error:', studentError);
        throw new Error(`Failed to create student record: ${studentError.message}`);
      }

      // Enroll in classes if provided
      if (userData.classIds && userData.classIds.length > 0) {
        const enrollments = userData.classIds.map(classId => ({
          class_id: classId,
          student_id: studentData.id,
          status: 'active'
        }));

        const { error: enrollError } = await supabaseAdmin
          .from('class_students')
          .insert(enrollments);

        if (enrollError) {
          console.error('Enrollment error:', enrollError);
          // Don't throw here, enrollment can be done later
        }
      }

      // Initialize student progress
      const { error: progressError } = await supabaseAdmin
        .from('student_progress')
        .insert({
          student_id: studentData.id,
          lessons_completed: 0,
          total_points: 0,
          streak_days: 0
        });

      if (progressError) {
        console.error('Progress error:', progressError);
        // Don't throw, progress can be initialized later
      }
    }

    if (userData.role === 'teacher') {
      // Create teacher profile
      const { error: teacherError } = await supabaseAdmin
        .from('teacher_profiles')
        .insert({
          user_id: userId,
          school_name: userData.district || '',
          grade_levels: userData.gradeLevelsTaught || [],
          subjects: userData.subjectAreas || [],
          onboarding_completed: false
        });

      if (teacherError) {
        console.error('Teacher error:', teacherError);
        throw new Error(`Failed to create teacher profile: ${teacherError.message}`);
      }
    }

    if (userData.role === 'admin') {
      // Create admin profile
      const adminTypeMap: Record<string, 'school' | 'district' | 'system'> = {
        'school': 'school',
        'district': 'district',
        'super': 'system'
      };

      const { error: adminError } = await supabaseAdmin
        .from('admin_profiles')
        .insert({
          user_id: userId,
          admin_type: adminTypeMap[userData.adminType || 'school'] || 'school',
          organization_name: userData.organization,
          onboarding_completed: false
        });

      if (adminError) {
        console.error('Admin error:', adminError);
        throw new Error(`Failed to create admin profile: ${adminError.message}`);
      }
    }

    // TODO: Send welcome email if requested
    // This would integrate with Resend or another email service
    if (userData.sendWelcomeEmail) {
      console.log(`Would send welcome email to ${userData.email} with password: ${password}`);
      // For now, we'll just log it
      // In production, integrate with Resend API
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        email: userData.email,
        userId: userId,
        password: password, // Can be removed in production for security
        sendWelcomeEmail: userData.sendWelcomeEmail
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
