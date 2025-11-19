import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface UpdateUserRequest {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'student' | 'admin' | 'developer';
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  status?: string;
  
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
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
    const userData: UpdateUserRequest = await req.json();
    
    console.log('Updating user:', userData.userId);

    // Update profile
    const fullName = `${userData.firstName} ${userData.lastName}`;
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        email: userData.email,
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    // Update email in auth.users if changed
    const { data: currentUser } = await supabaseAdmin.auth.admin.getUserById(userData.userId);
    if (currentUser && currentUser.user.email !== userData.email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
        userData.userId,
        {
          email: userData.email,
          email_confirm: false // Require re-verification
        }
      );

      if (emailError) {
        console.error('Email update error:', emailError);
        throw new Error(`Failed to update email: ${emailError.message}`);
      }
    }

    // Check if role changed
    const { data: currentRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.userId);

    const currentRole = currentRoles?.[0]?.role;

    if (currentRole !== userData.role) {
      // Delete old role
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userData.userId);

      // Insert new role
      await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.userId,
          role: userData.role
        });

      // Handle role-specific cleanup and setup
      if (currentRole === 'student' && userData.role !== 'student') {
        // Remove from classes if changing from student
        const { data: studentData } = await supabaseAdmin
          .from('students')
          .select('id')
          .eq('user_id', userData.userId)
          .single();

        if (studentData) {
          await supabaseAdmin
            .from('class_students')
            .delete()
            .eq('student_id', studentData.id);
        }
      }
    }

    // Update role-specific data
    if (userData.role === 'student') {
      // Update or create student record
      const { data: existingStudent } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('user_id', userData.userId)
        .single();

      if (existingStudent) {
        // Update existing student
        await supabaseAdmin
          .from('students')
          .update({
            first_name: userData.firstName,
            last_name: userData.lastName,
            grade_level: userData.gradeLevel || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.userId);

        // Update class enrollments
        if (userData.classIds && userData.classIds.length > 0) {
          // Remove existing enrollments
          await supabaseAdmin
            .from('class_students')
            .delete()
            .eq('student_id', existingStudent.id);

          // Add new enrollments
          const enrollments = userData.classIds.map(classId => ({
            class_id: classId,
            student_id: existingStudent.id,
            enrolled_at: new Date().toISOString(),
            status: 'active'
          }));

          await supabaseAdmin
            .from('class_students')
            .insert(enrollments);
        }
      } else {
        // Create new student record
        const { data: newStudent, error: studentError } = await supabaseAdmin
          .from('students')
          .insert({
            user_id: userData.userId,
            first_name: userData.firstName,
            last_name: userData.lastName,
            grade_level: userData.gradeLevel || null
          })
          .select()
          .single();

        if (studentError) {
          console.error('Student creation error:', studentError);
        } else if (newStudent && userData.classIds && userData.classIds.length > 0) {
          // Enroll in classes
          const enrollments = userData.classIds.map(classId => ({
            class_id: classId,
            student_id: newStudent.id,
            enrolled_at: new Date().toISOString(),
            status: 'active'
          }));

          await supabaseAdmin
            .from('class_students')
            .insert(enrollments);
        }
      }
    } else if (userData.role === 'teacher') {
      // Update or create teacher profile
      const { data: existingTeacher } = await supabaseAdmin
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', userData.userId)
        .single();

      const teacherData = {
        user_id: userData.userId,
        district: userData.district || null,
        grade_levels_taught: userData.gradeLevelsTaught || [],
        subject_areas: userData.subjectAreas || [],
        license_number: userData.licenseNumber || null,
        updated_at: new Date().toISOString()
      };

      if (existingTeacher) {
        await supabaseAdmin
          .from('teacher_profiles')
          .update(teacherData)
          .eq('user_id', userData.userId);
      } else {
        await supabaseAdmin
          .from('teacher_profiles')
          .insert(teacherData);
      }
    } else if (userData.role === 'admin') {
      // Update or create admin profile
      const { data: existingAdmin } = await supabaseAdmin
        .from('admin_profiles')
        .select('id')
        .eq('user_id', userData.userId)
        .single();

      const adminData = {
        user_id: userData.userId,
        admin_type: userData.adminType || 'school',
        organization_name: userData.organization || null,
        updated_at: new Date().toISOString()
      };

      if (existingAdmin) {
        await supabaseAdmin
          .from('admin_profiles')
          .update(adminData)
          .eq('user_id', userData.userId);
      } else {
        await supabaseAdmin
          .from('admin_profiles')
          .insert(adminData);
      }
    }

    // Log the update activity
    await supabaseAdmin
      .from('activity_log')
      .insert({
        user_id: userData.userId,
        action: 'user_updated',
        details: {
          updated_by: 'developer',
          fields_changed: Object.keys(userData)
        }
      });

    console.log('User updated successfully:', userData.userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User updated successfully',
        userId: userData.userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update user'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
