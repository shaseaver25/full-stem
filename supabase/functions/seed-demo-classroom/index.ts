import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEMO_TEACHER_ID = '00000000-0000-0000-0001-000000000001'
const DEMO_CLASS_ID = '00000000-0000-0000-0002-000000000001'
const DEMO_PASSWORD = 'DemoPassword2024!'

const DEMO_STUDENTS = [
  { firstName: 'Emma', lastName: 'Rodriguez', gradeLevel: '7th', readingLevel: 'Advanced' },
  { firstName: 'Marcus', lastName: 'Chen', gradeLevel: '7th', readingLevel: 'Advanced' },
  { firstName: 'Aisha', lastName: 'Patel', gradeLevel: '7th', readingLevel: 'Advanced' },
  { firstName: 'Jake', lastName: 'Wilson', gradeLevel: '7th', readingLevel: 'Proficient' },
  { firstName: 'Sofia', lastName: 'Martinez', gradeLevel: '7th', readingLevel: 'Proficient' },
  { firstName: 'Tyler', lastName: 'Anderson', gradeLevel: '7th', readingLevel: 'Proficient' },
  { firstName: 'Maya', lastName: 'Johnson', gradeLevel: '7th', readingLevel: 'Proficient' },
  { firstName: 'Jamal', lastName: 'Williams', gradeLevel: '7th', readingLevel: 'Developing' },
  { firstName: 'Olivia', lastName: 'Brown', gradeLevel: '7th', readingLevel: 'Developing' },
  { firstName: 'Carlos', lastName: 'Garcia', gradeLevel: '7th', readingLevel: 'Developing' },
  { firstName: 'Nina', lastName: 'Lee', gradeLevel: '7th', readingLevel: 'Developing' },
  { firstName: 'David', lastName: 'Kim', gradeLevel: '7th', readingLevel: 'Emerging' },
  { firstName: 'Jessica', lastName: 'Thompson', gradeLevel: '7th', readingLevel: 'Emerging' },
  { firstName: 'Ryan', lastName: 'Davis', gradeLevel: '7th', readingLevel: 'Emerging' },
  { firstName: 'Zoe', lastName: 'Miller', gradeLevel: '7th', readingLevel: 'Emerging' }
].map((s, i) => ({
  ...s,
  id: `00000000-0000-0000-0004-${String(i + 1).padStart(12, '0')}`,
  email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@demo.tailoredu.com`
}))

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { reset } = await req.json().catch(() => ({ reset: false }))

    // Always clean up existing demo data first
    console.log('🧹 Cleaning up existing demo data...')
    
    // Delete teacher by email
    const teacherEmail = 'demo.teacher@tailoredu.com'
    const { data: teacherUser, error: getTeacherError } = await supabase.auth.admin.getUserByEmail(teacherEmail)
    
    if (getTeacherError) {
      console.log(`⚠️ Error fetching teacher: ${getTeacherError.message}`)
    } else if (teacherUser) {
      const deleteResult = await supabase.auth.admin.deleteUser(teacherUser.id)
      if (deleteResult.error) {
        console.log(`❌ Failed to delete teacher: ${deleteResult.error.message}`)
      } else {
        console.log(`✅ Deleted teacher: ${teacherEmail}`)
      }
    } else {
      console.log(`⚠️ Teacher not found: ${teacherEmail}`)
    }
    
    // Delete students by email
    for (const student of DEMO_STUDENTS) {
      const { data: studentUser, error: getStudentError } = await supabase.auth.admin.getUserByEmail(student.email)
      
      if (getStudentError) {
        console.log(`⚠️ Error fetching student ${student.email}: ${getStudentError.message}`)
      } else if (studentUser) {
        const deleteResult = await supabase.auth.admin.deleteUser(studentUser.id)
        if (deleteResult.error) {
          console.log(`❌ Failed to delete student ${student.email}: ${deleteResult.error.message}`)
        } else {
          console.log(`✅ Deleted student: ${student.email}`)
        }
      } else {
        console.log(`⚠️ Student not found: ${student.email}`)
      }
    }
    
    // Database cleanup (cascading deletes will handle related data)
    await supabase.from('teacher_profiles').delete().eq('id', DEMO_TEACHER_ID)
    await supabase.from('classes').delete().eq('id', DEMO_CLASS_ID)

    // Create teacher auth user
    console.log('👨‍🏫 Creating demo teacher...')
    
    const { data: teacherAuth, error: teacherAuthError } = await supabase.auth.admin.createUser({
      email: teacherEmail,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Demo Teacher',
        role: 'teacher'
      }
    })

    if (teacherAuthError) {
      console.error('❌ Teacher auth error:', teacherAuthError)
      throw new Error(`Failed to create teacher: ${teacherAuthError.message}`)
    }

    const teacherUserId = teacherAuth.user.id
    console.log(`✅ Teacher created: ${teacherEmail}`)

    // Create teacher profile
    const { error: teacherProfileError } = await supabase
      .from('teacher_profiles')
      .insert({
        id: DEMO_TEACHER_ID,
        user_id: teacherUserId
      })

    if (teacherProfileError) {
      console.error('❌ Teacher profile error:', teacherProfileError)
      throw teacherProfileError
    }

    // Create class
    console.log('🏫 Creating demo class...')
    const { error: classError } = await supabase
      .from('classes')
      .insert({
        id: DEMO_CLASS_ID,
        teacher_id: DEMO_TEACHER_ID,
        name: '7th Grade Science - Adaptive Assessment Demo',
        description: 'Demo classroom with AI-powered adaptive assessments',
        subject: 'Science',
        grade_level: '7th',
        status: 'active',
        published: true
      })

    if (classError) {
      console.error('❌ Class error:', classError)
      throw classError
    }

    // Create students
    console.log('👥 Creating demo students...')
    const studentCredentials = []

    for (const student of DEMO_STUDENTS) {
      try {
        const { data: studentAuth, error: studentAuthError } = await supabase.auth.admin.createUser({
          email: student.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: {
            full_name: `${student.firstName} ${student.lastName}`,
            role: 'student'
          }
        })

        if (studentAuthError) {
          console.error(`⚠️ Failed: ${student.email}`, studentAuthError)
          continue
        }

        const studentUserId = studentAuth.user.id

        await supabase.from('students').insert({
          id: student.id,
          user_id: studentUserId,
          first_name: student.firstName,
          last_name: student.lastName,
          grade_level: student.gradeLevel,
          reading_level: student.readingLevel
        })

        await supabase.from('class_students').insert({
          class_id: DEMO_CLASS_ID,
          student_id: student.id,
          status: 'active'
        })

        studentCredentials.push({
          email: student.email,
          password: DEMO_PASSWORD,
          name: `${student.firstName} ${student.lastName}`,
          readingLevel: student.readingLevel
        })

        console.log(`✅ Created: ${student.email}`)
      } catch (error) {
        console.error(`⚠️ Error: ${student.email}`, error)
      }
    }

    console.log('✅ Demo environment ready!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo environment created successfully',
        teacher: {
          email: teacherEmail,
          password: DEMO_PASSWORD,
          name: 'Demo Teacher'
        },
        students: studentCredentials,
        class: {
          id: DEMO_CLASS_ID,
          name: '7th Grade Science - Adaptive Assessment Demo'
        },
        stats: {
          studentsCreated: studentCredentials.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('❌ Seed error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
