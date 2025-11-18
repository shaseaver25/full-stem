import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Demo data constants
const DEMO_TEACHER_ID = '00000000-0000-0000-0001-000000000001'
const DEMO_CLASS_ID = '00000000-0000-0000-0002-000000000001'
const DEMO_PASSWORD = 'DemoPassword2024!'
const DEMO_TEACHER_EMAIL = 'demo.teacher@tailoredu.com'

const DEMO_STUDENT_IDS = [
  '00000000-0000-0000-0004-000000000001',
  '00000000-0000-0000-0004-000000000002',
  '00000000-0000-0000-0004-000000000003',
  '00000000-0000-0000-0004-000000000004',
  '00000000-0000-0000-0004-000000000005',
  '00000000-0000-0000-0004-000000000006',
  '00000000-0000-0000-0004-000000000007',
  '00000000-0000-0000-0004-000000000008',
  '00000000-0000-0000-0004-000000000009',
  '00000000-0000-0000-0004-000000000010',
  '00000000-0000-0000-0004-000000000011',
  '00000000-0000-0000-0004-000000000012',
  '00000000-0000-0000-0004-000000000013',
  '00000000-0000-0000-0004-000000000014',
  '00000000-0000-0000-0004-000000000015',
]

const DEMO_ASSIGNMENT_IDS = [
  '00000000-0000-0000-0003-000000000001',
  '00000000-0000-0000-0003-000000000002',
  '00000000-0000-0000-0003-000000000003',
]

const DEMO_STUDENTS = [
  { name: 'Emma Rodriguez', level: 'advanced' },
  { name: 'Marcus Chen', level: 'advanced' },
  { name: 'Aisha Patel', level: 'advanced' },
  { name: 'Jake Wilson', level: 'proficient' },
  { name: 'Sofia Martinez', level: 'proficient' },
  { name: 'Tyler Anderson', level: 'proficient' },
  { name: 'Maya Johnson', level: 'proficient' },
  { name: 'Ethan Brown', level: 'proficient' },
  { name: 'Olivia Davis', level: 'developing' },
  { name: 'Noah Garcia', level: 'developing' },
  { name: 'Isabella Lee', level: 'developing' },
  { name: 'Liam Taylor', level: 'developing' },
  { name: 'Ava White', level: 'developing' },
  { name: 'Mia Martinez', level: 'emerging' },
  { name: 'Lucas Anderson', level: 'emerging' },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { reset = false } = await req.json()

    // ========================================
    // CLEANUP (if reset requested)
    // ========================================
    if (reset) {
      console.log('🗑️ Resetting demo environment...')
      
      // First, find actual auth user IDs from database
      const { data: existingTeacher } = await supabase
        .from('teacher_profiles')
        .select('user_id')
        .eq('id', DEMO_TEACHER_ID)
        .single()
      
      if (existingTeacher?.user_id) {
        try {
          await supabase.auth.admin.deleteUser(existingTeacher.user_id)
          console.log('✓ Deleted existing demo teacher auth user')
        } catch (e) {
          console.log('ℹ️ Could not delete demo teacher auth user')
        }
      }
      
      // Get all demo student user_ids from database
      const { data: existingStudents } = await supabase
        .from('students')
        .select('user_id')
        .in('id', DEMO_STUDENT_IDS)
      
      if (existingStudents) {
        for (const student of existingStudents) {
          if (student.user_id) {
            try {
              await supabase.auth.admin.deleteUser(student.user_id)
            } catch (e) {
              // Ignore
            }
          }
        }
        console.log('✓ Deleted demo student auth users')
      }
      
      // Delete database records
      await supabase.from('submission_analyses').delete().like('submission_id', '00000000-0000-0000%')
      await supabase.from('assignment_submissions').delete().like('id', '00000000-0000-0000%')
      await supabase.from('class_students').delete().like('student_id', '00000000-0000-0000%')
      await supabase.from('students').delete().like('id', '00000000-0000-0000%')
      await supabase.from('class_assignments_new').delete().like('id', '00000000-0000-0000%')
      await supabase.from('classes').delete().eq('id', DEMO_CLASS_ID)
      await supabase.from('teacher_profiles').delete().eq('id', DEMO_TEACHER_ID)
      
      console.log('✓ Demo environment reset complete')
    }

    // ========================================
    // CREATE DEMO TEACHER
    // ========================================
    console.log('👨‍🏫 Creating demo teacher...')
    
    const { data: teacherAuth, error: teacherError } = await supabase.auth.admin.createUser({
      email: DEMO_TEACHER_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Demo Teacher',
        role: 'teacher'
      }
    })

    if (teacherError) {
      console.error('Teacher creation error:', teacherError)
      throw new Error(`Failed to create teacher: ${teacherError.message}`)
    }

    console.log(`✓ Created auth user for teacher: ${DEMO_TEACHER_EMAIL}`)

    // Create teacher profile
    const { error: teacherProfileError } = await supabase
      .from('teacher_profiles')
      .insert({
        id: DEMO_TEACHER_ID,
        user_id: teacherAuth.user.id,
        school_name: 'Lincoln Elementary School',
        grade_levels: ['5'],
        subjects: ['Science'],
        years_experience: 8,
        onboarding_completed: true
      })

    if (teacherProfileError) {
      console.error('Teacher profile error:', teacherProfileError)
      throw new Error(`Failed to create teacher profile: ${teacherProfileError.message}`)
    }

    console.log('✓ Created teacher profile')

    // ========================================
    // CREATE DEMO CLASS
    // ========================================
    console.log('🏫 Creating demo class...')
    
    const { error: classError } = await supabase
      .from('classes')
      .insert({
        id: DEMO_CLASS_ID,
        name: '5th Grade Science - Room 204',
        subject: 'Science',
        grade_level: 5,
        teacher_id: DEMO_TEACHER_ID,
        published: true,
        status: 'active'
      })

    if (classError) {
      console.error('Class creation error:', classError)
      throw new Error(`Failed to create class: ${classError.message}`)
    }

    console.log('✓ Created demo class')

    // ========================================
    // CREATE DEMO STUDENTS
    // ========================================
    console.log('👥 Creating demo students...')
    
    const studentData = []
    
    for (let i = 0; i < DEMO_STUDENTS.length; i++) {
      const student = DEMO_STUDENTS[i]
      const [firstName, lastName] = student.name.split(' ')
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.student.com`
      
      // Create auth user
      const { data: studentAuth, error: studentAuthError } = await supabase.auth.admin.createUser({
        email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: student.name,
          role: 'student'
        }
      })

      if (studentAuthError) {
        console.error(`Error creating student ${student.name}:`, studentAuthError)
        continue
      }

      studentData.push({
        id: DEMO_STUDENT_IDS[i],
        user_id: studentAuth.user.id,
        first_name: firstName,
        last_name: lastName,
        grade_level: 5
      })

      console.log(`✓ Created ${student.name}`)
    }

    // Insert all students
    const { error: studentsError } = await supabase
      .from('students')
      .insert(studentData)

    if (studentsError) {
      console.error('Students insert error:', studentsError)
      throw new Error(`Failed to insert students: ${studentsError.message}`)
    }

    // Enroll students in class
    const enrollmentData = studentData.map(s => ({
      class_id: DEMO_CLASS_ID,
      student_id: s.id,
      status: 'active',
      enrolled_at: new Date().toISOString()
    }))

    const { error: enrollError } = await supabase
      .from('class_students')
      .insert(enrollmentData)

    if (enrollError) {
      console.error('Enrollment error:', enrollError)
      throw new Error(`Failed to enroll students: ${enrollError.message}`)
    }

    console.log(`✓ Created and enrolled ${studentData.length} students`)

    // ========================================
    // CREATE DEMO ASSIGNMENTS
    // ========================================
    console.log('📝 Creating demo assignments...')
    
    const assignments = [
      {
        id: DEMO_ASSIGNMENT_IDS[0],
        class_id: DEMO_CLASS_ID,
        title: 'Photosynthesis Explanation',
        description: 'Explain how plants make food from sunlight',
        instructions: 'Explain how plants make food from sunlight. Include the inputs (what goes in), the process (what happens), and the outputs (what comes out). Use at least 3 scientific terms.',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        max_points: 16,
        status: 'published'
      },
      {
        id: DEMO_ASSIGNMENT_IDS[1],
        class_id: DEMO_CLASS_ID,
        title: 'Water Cycle Diagram',
        description: 'Draw or describe the water cycle',
        instructions: 'Draw or describe the water cycle. Explain evaporation, condensation, precipitation, and collection.',
        due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_points: 12,
        status: 'published'
      },
      {
        id: DEMO_ASSIGNMENT_IDS[2],
        class_id: DEMO_CLASS_ID,
        title: 'Animal Adaptations Essay',
        description: 'Explain how animal features help survival',
        instructions: 'Choose an animal and explain how its physical features help it survive in its environment. Give at least 3 examples.',
        due_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        max_points: 15,
        status: 'published'
      }
    ]

    const { error: assignmentsError } = await supabase
      .from('class_assignments_new')
      .insert(assignments)

    if (assignmentsError) {
      console.error('Assignments error:', assignmentsError)
      throw new Error(`Failed to create assignments: ${assignmentsError.message}`)
    }

    console.log('✓ Created 3 demo assignments')

    // ========================================
    // RETURN SUCCESS
    // ========================================
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo environment created successfully',
        data: {
          teacher: {
            email: 'demo.teacher@tailoredu.com',
            password: DEMO_PASSWORD,
            name: 'Demo Teacher'
          },
          students: DEMO_STUDENTS.length,
          assignments: assignments.length,
          class_id: DEMO_CLASS_ID
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in seed-demo-classroom:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})