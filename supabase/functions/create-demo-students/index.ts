import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEMO_PASSWORD = 'DemoStudent2024!'

const DEMO_STUDENTS = [
  { email: 'emma.rodriguez@demo.student.com', firstName: 'Emma', lastName: 'Rodriguez' },
  { email: 'marcus.chen@demo.student.com', firstName: 'Marcus', lastName: 'Chen' },
  { email: 'olivia.davis@demo.student.com', firstName: 'Olivia', lastName: 'Davis' },
  { email: 'noah.garcia@demo.student.com', firstName: 'Noah', lastName: 'Garcia' },
  { email: 'mia.martinez@demo.student.com', firstName: 'Mia', lastName: 'Martinez' },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { teacherId, className = 'Demo Class - 5th Grade Science' } = await req.json()

    if (!teacherId) {
      throw new Error('teacherId is required')
    }

    console.log('🎓 Creating demo students...')
    
    // First, cleanup any existing demo data
    console.log('🗑️ Cleaning up existing demo data...')
    
    // Step 1: Find and collect all user IDs for demo students
    const demoUserIds: string[] = []
    const { data: users } = await supabase.auth.admin.listUsers()
    
    for (const student of DEMO_STUDENTS) {
      const existingUser = users?.users.find(u => u.email === student.email)
      if (existingUser) {
        demoUserIds.push(existingUser.id)
      }
    }
    
    console.log(`Found ${demoUserIds.length} existing demo users`)
    
    // Step 2: Delete demo class and related data
    try {
      const { data: existingClass } = await supabase
        .from('classes')
        .select('id')
        .eq('name', className)
        .eq('teacher_id', teacherId)
        .maybeSingle()
      
      if (existingClass) {
        await supabase.from('class_students').delete().eq('class_id', existingClass.id)
        await supabase.from('class_assignments_new').delete().eq('class_id', existingClass.id)
        await supabase.from('classes').delete().eq('id', existingClass.id)
        console.log('✓ Cleaned up existing demo class')
      }
    } catch (e) {
      console.log('ℹ️ No existing class to clean up:', e)
    }
    
    // Step 3: Delete class_students for demo users (any remaining enrollments)
    if (demoUserIds.length > 0) {
      const { data: studentIds } = await supabase
        .from('students')
        .select('id')
        .in('user_id', demoUserIds)
      
      if (studentIds && studentIds.length > 0) {
        const studentIdList = studentIds.map(s => s.id)
        await supabase.from('class_students').delete().in('student_id', studentIdList)
        console.log(`✓ Deleted class enrollments for ${studentIdList.length} students`)
      }
    }
    
    // Step 4: Delete student profiles
    if (demoUserIds.length > 0) {
      const { error: studentDeleteError } = await supabase
        .from('students')
        .delete()
        .in('user_id', demoUserIds)
      
      if (studentDeleteError) {
        console.log('Student delete error:', studentDeleteError)
      } else {
        console.log(`✓ Deleted ${demoUserIds.length} student profiles`)
      }
    }
    
    // Step 5: Delete auth users
    for (const student of DEMO_STUDENTS) {
      try {
        const existingUser = users?.users.find(u => u.email === student.email)
        if (existingUser) {
          await supabase.auth.admin.deleteUser(existingUser.id)
          console.log(`✓ Deleted auth user: ${student.email}`)
        }
      } catch (e) {
        console.log(`Could not delete auth user ${student.email}:`, e)
      }
    }

    // Step 1: Create auth users and student profiles
    const createdStudents = []
    
    for (const student of DEMO_STUDENTS) {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: student.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: `${student.firstName} ${student.lastName}`,
          role: 'student'
        }
      })

      if (authError) {
        console.error(`Error creating ${student.firstName}:`, authError)
        throw new Error(`Failed to create student ${student.firstName}: ${authError.message}`)
      }

      // Check if student profile was auto-created by trigger, or create it manually
      let studentProfile
      const { data: existingProfile } = await supabase
        .from('students')
        .select()
        .eq('user_id', authUser.user.id)
        .maybeSingle()

      if (existingProfile) {
        // Profile was created by trigger, just use it
        studentProfile = existingProfile
        console.log(`✓ Student profile auto-created for ${student.firstName}`)
      } else {
        // No trigger or profile doesn't exist, create manually
        const { data: newProfile, error: profileError } = await supabase
          .from('students')
          .insert({
            user_id: authUser.user.id,
            first_name: student.firstName,
            last_name: student.lastName,
            grade_level: 5
          })
          .select()
          .single()

        if (profileError) {
          console.error(`Error creating profile for ${student.firstName}:`, profileError)
          throw new Error(`Failed to create profile for ${student.firstName}: ${profileError.message}`)
        }
        
        studentProfile = newProfile
      }

      createdStudents.push({
        email: student.email,
        authUserId: authUser.user.id,
        studentId: studentProfile.id,
        name: `${student.firstName} ${student.lastName}`
      })

      console.log(`✓ Created ${student.firstName} ${student.lastName}`)
    }

    // Step 2: Create demo class
    const { data: demoClass, error: classError } = await supabase
      .from('classes')
      .insert({
        name: className,
        subject: 'Science',
        grade_level: 5,
        teacher_id: teacherId,
        published: true,
        status: 'active'
      })
      .select()
      .single()

    if (classError) {
      console.error('Class creation error:', classError)
      throw new Error(`Failed to create class: ${classError.message}`)
    }

    console.log('✓ Created demo class')

    // Step 3: Enroll students in class
    const enrollmentData = createdStudents.map(s => ({
      class_id: demoClass.id,
      student_id: s.studentId,
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

    console.log(`✓ Enrolled ${createdStudents.length} students`)

    // Step 4: Create demo assignment
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const { data: assignment, error: assignmentError } = await supabase
      .from('class_assignments_new')
      .insert({
        class_id: demoClass.id,
        title: 'Photosynthesis Explanation',
        description: 'Explain how plants make food from sunlight',
        instructions: 'Explain how plants make food from sunlight. Include the inputs (what goes in), the process (what happens), and the outputs (what comes out). Use at least 3 scientific terms in your explanation.',
        due_date: threeDaysAgo.toISOString().split('T')[0],
        max_points: 16,
        status: 'published'
      })
      .select()
      .single()

    if (assignmentError) {
      console.error('Assignment error:', assignmentError)
      throw new Error(`Failed to create assignment: ${assignmentError.message}`)
    }

    console.log('✓ Created demo assignment')

    // Return confirmation
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo environment created successfully',
        data: {
          students: createdStudents,
          class: {
            id: demoClass.id,
            name: demoClass.name
          },
          assignment: {
            id: assignment.id,
            title: assignment.title
          },
          credentials: {
            password: DEMO_PASSWORD,
            studentEmails: DEMO_STUDENTS.map(s => s.email)
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-demo-students:', error)
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
