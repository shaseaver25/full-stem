import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from '../_shared/cors.ts';

interface CSVRow {
  first_name: string;
  last_name: string;
  email: string;
  grade_level?: string;
  student_id?: string;
}

interface ImportResult {
  success: boolean;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  action: 'created' | 'existing' | 'error';
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    
    // Client for authentication and authorization checks
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Admin client for user creation
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

    // Verify authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { csvData, classId } = await req.json();

    if (!csvData || !classId) {
      throw new Error('Missing csvData or classId');
    }

    console.log(`Processing CSV import for class ${classId} by user ${user.id}`);

    // Verify user is a teacher and has access to this class
    const { data: teacherProfile, error: teacherError } = await supabaseClient
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (teacherError || !teacherProfile) {
      throw new Error('User is not a teacher');
    }

    const { data: classData, error: classError } = await supabaseClient
      .from('classes')
      .select('id')
      .eq('id', classId)
      .eq('teacher_id', teacherProfile.id)
      .single();

    if (classError || !classData) {
      throw new Error('Class not found or access denied');
    }

    // Parse CSV data
    const rows = csvData.split('\n').filter((row: string) => row.trim());
    if (rows.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    const headers = rows[0].split(',').map((h: string) => h.trim().toLowerCase());
    const requiredFields = ['first_name', 'last_name', 'email'];
    
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const results: ImportResult[] = [];

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map((v: string) => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const studentData: CSVRow = {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        grade_level: row.grade_level || '',
        student_id: row.student_id || ''
      };

      // Validate required fields
      if (!studentData.first_name || !studentData.last_name || !studentData.email) {
        results.push({
          success: false,
          student: {
            id: '',
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            email: studentData.email
          },
          action: 'error',
          error: 'Missing required fields'
        });
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(studentData.email)) {
        results.push({
          success: false,
          student: {
            id: '',
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            email: studentData.email
          },
          action: 'error',
          error: 'Invalid email format'
        });
        continue;
      }

      try {
        // First check if user already exists by email
        const { data: existingUsers, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();
        
        const existingUser = existingUsers?.users?.find(u => u.email === studentData.email);
        
        let userId = existingUser?.id;
        let action: 'created' | 'existing' = existingUser ? 'existing' : 'created';

        // Only create user if they don't exist
        if (!userId) {
          const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email: studentData.email,
            email_confirm: true,
            user_metadata: {
              first_name: studentData.first_name,
              last_name: studentData.last_name,
              role: 'student'
            }
          });

          if (signUpError) {
            console.error('Error creating user:', signUpError);
            results.push({
              success: false,
              student: {
                id: '',
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                email: studentData.email
              },
              action: 'error',
              error: signUpError.message
            });
            continue;
          }

          userId = newUser.user.id;
        }

        // Check if student record exists using admin client
        const { data: existingStudent } = await supabaseAdmin
          .from('students')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        let studentId = existingStudent?.id;

        // Create or update student record - ensure user_id is always set
        if (!studentId) {
          const { data: newStudent, error: studentError } = await supabaseAdmin
            .from('students')
            .upsert({
              user_id: userId,
              first_name: studentData.first_name,
              last_name: studentData.last_name,
              grade_level: studentData.grade_level || ''
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            })
            .select('id')
            .single();

          if (studentError) {
            console.error('Error creating student:', studentError);
            results.push({
              success: false,
              student: {
                id: userId,
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                email: studentData.email
              },
              action: 'error',
              error: studentError.message
            });
            continue;
          }

          studentId = newStudent.id;
        }

        // Only proceed if we have both userId and studentId
        if (!userId || !studentId) {
          results.push({
            success: false,
            student: {
              id: studentId || '',
              first_name: studentData.first_name,
              last_name: studentData.last_name,
              email: studentData.email
            },
            action: 'error',
            error: 'Failed to create or find user account and student record'
          });
          continue;
        }

        // Check if already enrolled
        const { data: existingEnrollment } = await supabaseClient
          .from('class_students')
          .select('id')
          .eq('class_id', classId)
          .eq('student_id', studentId)
          .maybeSingle();

        // Enroll student in class if not already enrolled
        if (!existingEnrollment) {
          const { error: enrollError } = await supabaseAdmin
            .from('class_students')
            .insert({
              class_id: classId,
              student_id: studentId,
              status: 'active'
            });

          if (enrollError) {
            console.error('Error enrolling student:', enrollError);
            results.push({
              success: false,
              student: {
                id: studentId,
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                email: studentData.email
              },
              action: 'error',
              error: enrollError.message
            });
            continue;
          }
        }

        results.push({
          success: true,
          student: {
            id: studentId,
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            email: studentData.email
          },
          action: action
        });

      } catch (error: any) {
        console.error('Error processing student:', error);
        results.push({
          success: false,
          student: {
            id: '',
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            email: studentData.email
          },
          action: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`Import completed: ${successCount} successful, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        results: results,
        summary: {
          total: results.length,
          successful: successCount,
          errors: errorCount,
          created: results.filter(r => r.action === 'created').length,
          existing: results.filter(r => r.action === 'existing').length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('CSV import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
