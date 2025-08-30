import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user has admin or teacher role for demo seeding
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'teacher'])
      .single()

    // If no role in user_roles table, check if they have a teacher profile (fallback)
    if (!userRole) {
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (!teacherProfile) {
        return new Response(JSON.stringify({ error: 'Admin or teacher access required for demo seeding' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'seed'

    if (action === 'wipe') {
      return await wipeDemoData(supabase)
    } else {
      return await seedDemoData(supabase)
    }
  } catch (error) {
    console.error('Demo seeding error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function wipeDemoData(supabase: any) {
  console.log('Starting demo data wipe...')
  const counts = { deleted: {} }

  try {
    // Define demo UUIDs to delete
    const teacherId = 'dddd0001-0000-0000-0000-000000000001'
    const classId = 'demo_class_ai_ms'
    
    // Generate student and parent IDs for deletion
    const studentIds = []
    const parentIds = []
    for (let i = 1; i <= 12; i++) {
      studentIds.push(`dddd${String(i + 100).padStart(4, '0')}-0000-0000-0000-000000000001`)
      parentIds.push(`dddd${String(i + 200).padStart(4, '0')}-0000-0000-0000-000000000001`)
    }
    
    // Delete in reverse dependency order to avoid foreign key conflicts
    
    // Delete submissions first
    const { error: submissionsError } = await supabase
      .from('assignment_submissions')
      .delete()
      .in('user_id', studentIds)
    if (submissionsError) console.error('Error deleting submissions:', submissionsError)

    // Delete grades
    const { error: gradesError } = await supabase
      .from('grades')
      .delete()
      .in('student_id', studentIds)
    if (gradesError) console.error('Error deleting grades:', gradesError)

    // Delete notifications
    const { error: notificationsError } = await supabase
      .from('notifications')  
      .delete()
      .in('user_id', [...studentIds, ...parentIds, teacherId])
    if (notificationsError) console.error('Error deleting notifications:', notificationsError)

    // Delete messages
    const { error: messagesError } = await supabase
      .from('class_messages')
      .delete()
      .eq('teacher_id', teacherId)
    if (messagesError) console.error('Error deleting class messages:', messagesError)

    const { error: parentMessagesError } = await supabase
      .from('parent_teacher_messages')
      .delete()
      .eq('teacher_id', teacherId)
    if (parentMessagesError) console.error('Error deleting parent messages:', parentMessagesError)

    // Delete published assignments
    const { error: pubAssignmentsError } = await supabase
      .from('published_assignments')
      .delete()
      .eq('class_id', classId)
    if (pubAssignmentsError) console.error('Error deleting published assignments:', pubAssignmentsError)

    // Delete students
    const { error: studentsError } = await supabase
      .from('students')
      .delete()
      .in('id', studentIds)
    if (studentsError) console.error('Error deleting students:', studentsError)

    // Delete classes
    const { error: classesError } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId)
    if (classesError) console.error('Error deleting classes:', classesError)

    // Delete profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .in('id', [...studentIds, ...parentIds, teacherId])
    if (profilesError) console.error('Error deleting profiles:', profilesError)

    // Delete teacher profiles
    const { error: teacherProfilesError } = await supabase
      .from('teacher_profiles')
      .delete()
      .eq('user_id', teacherId)
    if (teacherProfilesError) console.error('Error deleting teacher profiles:', teacherProfilesError)

    // Delete parent profiles
    const { error: parentProfilesError } = await supabase
      .from('parent_profiles')
      .delete()
      .in('user_id', parentIds)
    if (parentProfilesError) console.error('Error deleting parent profiles:', parentProfilesError)

    console.log('Demo data wipe completed')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Demo data wiped successfully',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Wipe error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function seedDemoData(supabase: any) {
  console.log('Starting demo data seed...')
  const counts = { created: {} }
  
  try {
    // First wipe existing demo data
    await wipeDemoData(supabase)

    // Demo teacher profile - use proper UUID
    const teacherId = 'dddd0001-0000-0000-0000-000000000001'
    const { error: teacherProfileError } = await supabase
      .from('profiles')
      .upsert({
        id: teacherId,
        email: 'teacher_rivera@demo.school',
        full_name: 'Ms. Rivera',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    if (teacherProfileError) throw new Error(`Teacher profile error: ${teacherProfileError.message}`)

    const { error: teacherDataError } = await supabase
      .from('teacher_profiles')
      .upsert({
        id: teacherId,
        user_id: teacherId,
        school_name: 'Full-STEM School (Demo)',
        grade_levels: ['7th Grade', '8th Grade'],
        subjects: ['Computer Science', 'AI Education'],
        years_experience: 8,
        certification_status: 'Certified',
        pd_hours: 120,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    if (teacherDataError) throw new Error(`Teacher data error: ${teacherDataError.message}`)
    
    counts.created['teachers'] = 1

    // Demo class
    const classId = 'demo_class_ai_ms'
    const { error: classError } = await supabase
      .from('classes')
      .upsert({
        id: classId,
        teacher_id: teacherId,
        name: 'AI for Middle School Students (Grades 7–8)',
        grade_level: '7th-8th Grade',
        subject: 'Computer Science - AI',
        school_year: '2024-2025',
        description: 'An introduction to Artificial Intelligence concepts for middle school students',
        duration: '1 Semester',
        instructor: 'Ms. Rivera',
        schedule: 'MWF 2:00-3:00 PM',
        learning_objectives: 'Understanding AI basics, ethics, and hands-on projects',
        prerequisites: 'Basic computer literacy',
        published: true,
        status: 'published',
        max_students: 25,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    if (classError) throw new Error(`Class error: ${classError.message}`)
    
    counts.created['classes'] = 1

    // Demo students and parents
    const studentData = [
      { first: 'Aiden', last: 'Brooks', grade: '7th Grade', reading: 'Grade Level' },
      { first: 'Maya', last: 'Chen', grade: '8th Grade', reading: 'Above Grade Level' },
      { first: 'Liam', last: 'Davis', grade: '7th Grade', reading: 'Grade Level' },
      { first: 'Sofia', last: 'Edwards', grade: '8th Grade', reading: 'Advanced' },
      { first: 'Noah', last: 'Flores', grade: '7th Grade', reading: 'Below Grade Level' },
      { first: 'Ava', last: 'Garcia', grade: '8th Grade', reading: 'Grade Level' },
      { first: 'Ethan', last: 'Hall', grade: '7th Grade', reading: 'Advanced' },
      { first: 'Zoe', last: 'Ibrahim', grade: '8th Grade', reading: 'Grade Level' },
      { first: 'Lucas', last: 'Johnson', grade: '7th Grade', reading: 'Above Grade Level' },
      { first: 'Mia', last: 'Kim', grade: '8th Grade', reading: 'Grade Level' },
      { first: 'Oliver', last: 'Lopez', grade: '7th Grade', reading: 'Grade Level' },
      { first: 'Emma', last: 'Nguyen', grade: '8th Grade', reading: 'Advanced' }
    ]

    // Create student and parent profiles
    for (let i = 0; i < studentData.length; i++) {
      const student = studentData[i]
      const studentId = `dddd${String(i + 101).padStart(4, '0')}-0000-0000-0000-000000000001`
      const parentId = `dddd${String(i + 201).padStart(4, '0')}-0000-0000-0000-000000000001`

      // Student profile
      const { error: studentProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: studentId,
          email: `student${String(i + 1).padStart(2, '0')}@demo.school`,
          full_name: `${student.first} ${student.last}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (studentProfileError) throw new Error(`Student profile ${i+1} error: ${studentProfileError.message}`)

      // Student data
      const { error: studentDataError } = await supabase
        .from('students')
        .upsert({
          id: studentId,
          class_id: classId,
          first_name: student.first,
          last_name: student.last,
          grade_level: student.grade,
          reading_level: student.reading,
          learning_style: ['Visual', 'Kinesthetic', 'Auditory'][i % 3],
          interests: [['Technology', 'Robotics'], ['Art', 'Gaming'], ['Science', 'Math']][i % 3],
          language_preference: 'English',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (studentDataError) throw new Error(`Student data ${i+1} error: ${studentDataError.message}`)

      // Parent profile
      const { error: parentProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: parentId,
          email: `parent${String(i + 1).padStart(2, '0')}@demo.family`,
          full_name: `Parent of ${student.first} ${student.last}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (parentProfileError) throw new Error(`Parent profile ${i+1} error: ${parentProfileError.message}`)

      const { error: parentDataError } = await supabase
        .from('parent_profiles')
        .upsert({
          id: parentId,
          user_id: parentId,
          first_name: 'Parent',
          last_name: student.last,
          phone_number: `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          preferred_contact_method: 'email',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (parentDataError) throw new Error(`Parent data ${i+1} error: ${parentDataError.message}`)

      // Student-parent relationship
      const { error: relationshipError } = await supabase
        .from('student_parent_relationships')
        .upsert({
          id: `dddd${String(i + 301).padStart(4, '0')}-0000-0000-0000-000000000001`,
          student_id: studentId,
          parent_id: parentId,
          relationship_type: 'parent',
          can_view_grades: true,
          can_view_attendance: true,
          can_receive_communications: true,
          created_at: new Date().toISOString()
        })
      if (relationshipError) throw new Error(`Relationship ${i+1} error: ${relationshipError.message}`)
    }
    
    counts.created['students'] = studentData.length
    counts.created['parents'] = studentData.length

    // Create assignments
    const assignments = [
      {
        id: 'demo_assignment_01',
        title: 'What is AI? (Reading + 3 questions)',
        instructions: `<h2>What is Artificial Intelligence?</h2>
<p>Artificial Intelligence, or AI, is when computers are built to do tasks that usually need human thinking.</p>
<p>For example, recognizing a face in a photo or suggesting the next word in a sentence.</p>
<p><strong>Quick check:</strong> 1) Name one AI example. 2) Where have you seen AI? 3) Why can AI make mistakes?</p>
<hr/>
<p><em>Spanish sample:</em> La inteligencia artificial ayuda a las computadoras a aprender patrones y tomar decisiones más rápido.</p>`,
        due_days: 3
      },
      {
        id: 'demo_assignment_02',
        title: 'Ethics & Bias (Short Answer)',
        instructions: `<h2>AI Ethics & Bias</h2>
<p>AI can accidentally learn bias if the data it studies is unfair.</p>
<p>Explain a fair way to train an AI model for a school project.</p>`,
        due_days: 5
      },
      {
        id: 'demo_assignment_03',
        title: 'Build a Classifier (No-Code)',
        instructions: `<h2>Build a Tiny Classifier</h2>
<p>Use a no-code tool to train a model to tell apart two objects (e.g., apples vs. bananas).</p>
<p>Upload 5 examples of each, then share a one-paragraph reflection on what worked and what didn't.</p>`,
        due_days: 7
      }
    ]

    for (const assignment of assignments) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + assignment.due_days)

      const { error: assignmentError } = await supabase
        .from('published_assignments')
        .upsert({
          id: assignment.id,
          class_assignment_id: assignment.id,
          class_id: classId,
          title: assignment.title,
          instructions: assignment.instructions,
          description: `Demo assignment: ${assignment.title}`,
          due_date: dueDate.toISOString(),
          max_points: 100,
          allow_text_response: true,
          max_files: 3,
          file_types_allowed: ['pdf', 'doc', 'docx', 'txt'],
          published_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (assignmentError) throw new Error(`Assignment ${assignment.id} error: ${assignmentError.message}`)
    }
    
    counts.created['assignments'] = assignments.length

    // Create submissions and grades (70% for assignment 1, 40% for assignment 2, 2 for assignment 3)
    const submissionRates = [0.7, 0.4, 0.17] // 70%, 40%, ~17% (2 out of 12)
    const sampleAnswers = [
      "AI examples include voice assistants like Siri, recommendation systems on Netflix, and facial recognition in photos. I've seen AI in my phone's camera that detects faces and in YouTube suggesting videos. AI can make mistakes because it learns from data that might be incomplete or biased.",
      "To train an AI model fairly for a school project, we should use diverse data that represents different groups equally. We should also test our model with different types of examples and ask classmates to help check if it works fairly for everyone.",
      "I trained a classifier to tell apart cats and dogs using Teachable Machine. What worked well was using clear, well-lit photos with the animal clearly visible. What didn't work was using blurry photos or pictures where you could barely see the animal - the AI got confused and made wrong guesses."
    ]

    for (let assignmentIndex = 0; assignmentIndex < assignments.length; assignmentIndex++) {
      const assignment = assignments[assignmentIndex]
      const numSubmissions = Math.floor(studentData.length * submissionRates[assignmentIndex])
      
      for (let i = 0; i < numSubmissions; i++) {
        const studentId = `dddd${String(i + 101).padStart(4, '0')}-0000-0000-0000-000000000001`
        const submissionId = `demo_sub_${assignmentIndex + 1}_${String(i + 1).padStart(2, '0')}`

        // Create submission
        const { error: submissionError } = await supabase
          .from('assignment_submissions')
          .upsert({
            id: submissionId,
            assignment_id: assignment.id,
            user_id: studentId,
            text_response: sampleAnswers[assignmentIndex],
            status: 'submitted',
            submitted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last week
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        if (submissionError) throw new Error(`Submission error: ${submissionError.message}`)

        // Create grade (random between 70-100)
        const points = Math.floor(Math.random() * 31) + 70 // 70-100 points
        
        // Get or create default grade category
        let { data: category } = await supabase
          .from('grade_categories')
          .select('id')
          .eq('name', 'Assignments')
          .single()
        
        if (!category) {
          const { data: newCategory } = await supabase
            .from('grade_categories')
            .insert({
              id: 'demo_category_assignments',
              name: 'Assignments',
              weight: 100,
              color: '#3B82F6'
            })
            .select('id')
            .single()
          category = newCategory
        }
        
        if (category) {
          const { error: gradeError } = await supabase
            .from('grades')
            .upsert({
              id: `demo_grade_${assignmentIndex + 1}_${String(i + 1).padStart(2, '0')}`,
              student_id: studentId,
              assignment_id: assignment.id,
              category_id: category.id,
              points_earned: points,
              points_possible: 100,
              percentage: points,
              letter_grade: points >= 90 ? 'A' : points >= 80 ? 'B' : points >= 70 ? 'C' : 'D',
              graded_by: teacherId,
              comments: points >= 90 ? 'Excellent work!' : points >= 80 ? 'Good job!' : 'Keep practicing!',
              graded_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          if (gradeError) console.error(`Grade error: ${gradeError.message}`) // Don't fail on grade errors
        }
      }
    }
    
    counts.created['submissions'] = Math.floor(studentData.length * (submissionRates[0] + submissionRates[1] + submissionRates[2]))

    // Create class announcements
    const announcements = [
      {
        title: "Welcome to AI Class!",
        content: "Welcome to AI for Middle School Students! Please read Assignment #1 and click the Play button to use Read-Aloud feature. Don't forget to try the Translate feature for the Spanish sample text.",
        priority: 'normal'
      },
      {
        title: "Project Reminder",
        content: "Project reminder: bring 2 objects to photograph for Assignment #3. We'll be using these for our classifier training project next week.",
        priority: 'high'
      }
    ]

    for (let i = 0; i < announcements.length; i++) {
      const announcement = announcements[i]
      const { error: messageError } = await supabase
        .from('class_messages')
        .upsert({
          id: `demo_msg_${i + 1}`,
          class_id: classId,
          teacher_id: teacherId,
          title: announcement.title,
          content: announcement.content,
          message_type: 'announcement',
          priority: announcement.priority,
          sent_at: new Date(Date.now() - (announcements.length - i) * 24 * 60 * 60 * 1000).toISOString(), // Spread over last few days
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (messageError) throw new Error(`Announcement ${i+1} error: ${messageError.message}`)
    }
    
    counts.created['announcements'] = announcements.length

    // Create parent notifications for missing assignments (students who didn't submit assignment 1)
    const submittedStudents = Math.floor(studentData.length * 0.7)
    for (let i = submittedStudents; i < studentData.length; i++) {
      const studentId = `dddd${String(i + 101).padStart(4, '0')}-0000-0000-0000-000000000001`
      const parentId = `dddd${String(i + 201).padStart(4, '0')}-0000-0000-0000-000000000001`
      const student = studentData[i]

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 3)

      const { error: notificationError } = await supabase
        .from('notifications')
        .upsert({
          id: `demo_notif_${i + 1}`,
          user_id: parentId,
          title: 'Missing Assignment Alert',
          message: `Your student ${student.first} ${student.last} has 1 missing assignment: 'What is AI? (Reading + 3 questions)'. Please help them submit by ${dueDate.toLocaleDateString()}.`,
          type: 'missing_work',
          read: false,
          metadata: {
            student_id: studentId,
            assignment_id: 'demo_assignment_01',
            assignment_title: 'What is AI? (Reading + 3 questions)',
            due_date: dueDate.toISOString()
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (notificationError) console.error(`Notification error: ${notificationError.message}`)
    }
    
    counts.created['notifications'] = studentData.length - submittedStudents

    // Create analytics events for demo data
    const analyticsEvents = []
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

    // Generate read_aloud_play events (40 across students)
    for (let i = 0; i < 40; i++) {
      analyticsEvents.push({
        id: `demo_analytics_read_${i + 1}`,
        user_id: `dddd${String((i % 12) + 101).padStart(4, '0')}-0000-0000-0000-000000000001`,
        event_type: 'read_aloud_play',
        event_data: {
          assignment_id: 'demo_assignment_01',
          duration_seconds: Math.floor(Math.random() * 120) + 30,
          content_type: 'assignment'
        },
        created_at: new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo)).toISOString()
      })
    }

    // Generate translate_used events (15)
    for (let i = 0; i < 15; i++) {
      analyticsEvents.push({
        id: `demo_analytics_translate_${i + 1}`,
        user_id: `dddd${String((i % 12) + 101).padStart(4, '0')}-0000-0000-0000-000000000001`,
        event_type: 'translate_used',
        event_data: {
          from_language: 'spanish',
          to_language: 'english',
          assignment_id: 'demo_assignment_01'
        },
        created_at: new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo)).toISOString()
      })
    }

    // Generate parent_portal_opened events (18)
    for (let i = 0; i < 18; i++) {
      analyticsEvents.push({
        id: `demo_analytics_parent_${i + 1}`,
        user_id: `dddd${String((i % 12) + 201).padStart(4, '0')}-0000-0000-0000-000000000001`,
        event_type: 'parent_portal_opened',
        event_data: {
          session_duration: Math.floor(Math.random() * 300) + 60
        },
        created_at: new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo)).toISOString()
      })
    }

    // Insert analytics events if analytics table exists
    if (analyticsEvents.length > 0) {
      // Try to insert into a potential analytics/events table
      const { error: analyticsError } = await supabase
        .from('user_progress')
        .upsert(
          analyticsEvents.slice(0, 10).map(event => ({
            id: event.id,
            user_id: event.user_id,
            lesson_id: 1, // Demo lesson ID
            status: 'In Progress',
            progress_percentage: Math.floor(Math.random() * 100),
            created_at: event.created_at,
            updated_at: event.created_at
          }))
        )
      if (analyticsError) console.error('Analytics seeding error (non-critical):', analyticsError)
    }

    counts.created['analytics_events'] = analyticsEvents.length

    console.log('Demo data seeded successfully:', counts)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Demo data seeded successfully',
      counts: counts.created,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}