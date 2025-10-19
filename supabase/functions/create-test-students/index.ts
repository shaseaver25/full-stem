import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestStudent {
  email: string;
  password: string;
  fullName: string;
  firstName: string;
  lastName: string;
  readingLevel: string;
  language: string;
}

const TEST_STUDENTS: TestStudent[] = [
  {
    email: 'ava.green@test.tailoredu.org',
    password: 'Test@123',
    fullName: 'Ava Green',
    firstName: 'Ava',
    lastName: 'Green',
    readingLevel: 'grade_3',
    language: 'en'
  },
  {
    email: 'mateo.rivera@test.tailoredu.org',
    password: 'Test@123',
    fullName: 'Mateo Rivera',
    firstName: 'Mateo',
    lastName: 'Rivera',
    readingLevel: 'grade_5',
    language: 'es'
  },
  {
    email: 'jordan.lee@test.tailoredu.org',
    password: 'Test@123',
    fullName: 'Jordan Lee',
    firstName: 'Jordan',
    lastName: 'Lee',
    readingLevel: 'on_grade',
    language: 'en'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🎓 Starting test student account creation...')

    // Step 1: Create or get the test class
    console.log('📚 Creating test class...')
    const { data: existingClass, error: classCheckError } = await supabase
      .from('classes')
      .select('id, teacher_id')
      .eq('name', 'Adaptive Engine Test – Fall 2025')
      .maybeSingle()

    let classId: string
    let teacherId: string

    if (existingClass) {
      console.log('✓ Test class already exists:', existingClass.id)
      classId = existingClass.id
      teacherId = existingClass.teacher_id
    } else {
      // Get any teacher profile to assign the class to
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .limit(1)
        .single()

      if (!teacherProfile) {
        throw new Error('No teacher profiles found. Please create a teacher account first.')
      }

      teacherId = teacherProfile.id

      const { data: newClass, error: classError } = await supabase
        .from('classes')
        .insert({
          name: 'Adaptive Engine Test – Fall 2025',
          description: 'Testing class for adaptive engine UX validation',
          teacher_id: teacherId,
          subject: 'STEM',
          grade_level: 'Mixed',
          published: true,
          status: 'active'
        })
        .select('id')
        .single()

      if (classError) throw classError
      
      classId = newClass.id
      console.log('✓ Test class created:', classId)
    }

    const results = []

    // Step 2: Create each student account
    for (const student of TEST_STUDENTS) {
      console.log(`\n👤 Creating account for ${student.fullName}...`)

      try {
        // Check if user already exists
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const userExists = existingUser?.users.find(u => u.email === student.email)

        let userId: string

        if (userExists) {
          console.log(`  ⚠️  User ${student.email} already exists, updating...`)
          userId = userExists.id
          
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { password: student.password }
          )
          if (updateError) throw updateError
        } else {
          // Create new user
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: student.email,
            password: student.password,
            email_confirm: true,
            user_metadata: {
              full_name: student.fullName,
              first_name: student.firstName,
              last_name: student.lastName,
              role: 'student'
            }
          })

          if (createError) throw createError
          userId = newUser.user.id
          console.log(`  ✓ Auth user created: ${userId}`)
        }

        // Upsert profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: student.email,
            full_name: student.fullName
          })

        if (profileError) throw profileError
        console.log('  ✓ Profile created/updated')

        // Upsert student record
        const { data: studentRecord, error: studentError } = await supabase
          .from('students')
          .upsert({
            user_id: userId,
            first_name: student.firstName,
            last_name: student.lastName,
            reading_level: student.readingLevel,
            language_preference: student.language
          }, {
            onConflict: 'user_id'
          })
          .select('id')
          .single()

        if (studentError) throw studentError
        console.log('  ✓ Student record created/updated')

        const studentId = studentRecord.id

        // Assign student role
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'student'
          }, {
            onConflict: 'user_id,role'
          })

        if (roleError) throw roleError
        console.log('  ✓ Student role assigned')

        // Enroll in test class
        const { error: enrollError } = await supabase
          .from('class_students')
          .upsert({
            class_id: classId,
            student_id: studentId,
            status: 'active'
          }, {
            onConflict: 'class_id,student_id'
          })

        if (enrollError) throw enrollError
        console.log('  ✓ Enrolled in test class')

        results.push({
          success: true,
          email: student.email,
          password: student.password,
          fullName: student.fullName,
          readingLevel: student.readingLevel,
          language: student.language,
          userId,
          studentId
        })

        console.log(`✅ ${student.fullName} setup complete!`)

      } catch (error) {
        console.error(`❌ Error creating ${student.fullName}:`, error)
        results.push({
          success: false,
          email: student.email,
          fullName: student.fullName,
          error: error.message
        })
      }
    }

    // Summary
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`\n📊 Summary: ${successCount} successful, ${failCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${successCount} test students`,
        classId,
        className: 'Adaptive Engine Test – Fall 2025',
        results,
        credentials: results
          .filter(r => r.success)
          .map(r => ({
            email: r.email,
            password: r.password,
            name: r.fullName,
            readingLevel: r.readingLevel,
            language: r.language
          }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Fatal error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})