import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🌱 Starting demo environment seeding...');

    // Auth check: Verify user is admin or developer
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Unauthorized: Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin or Developer access required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin or developer role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin', 'developer']);

    if (!roles || roles.length === 0) {
      console.error('❌ Insufficient permissions for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin or Developer role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Authorization successful. User:', user.email);

    // 1. Create demo teacher user
    console.log('👨‍🏫 Creating demo teacher...');
    const teacherEmail = 'teacher_demo@tailoredu.org';
    let teacherUserId: string;

    const { data: existingTeacherAuth } = await supabase.auth.admin.listUsers();
    const existingTeacher = existingTeacherAuth.users.find(u => u.email === teacherEmail);

    if (existingTeacher) {
      teacherUserId = existingTeacher.id;
      console.log('Teacher user already exists:', teacherUserId);
    } else {
      const { data: newTeacher, error: teacherError } = await supabase.auth.admin.createUser({
        email: teacherEmail,
        password: 'Demo2024!Teacher',
        email_confirm: true,
        user_metadata: {
          role: 'teacher',
          full_name: 'Dr. Alicia Navarro',
        }
      });

      if (teacherError) {
        console.error('Error creating teacher:', teacherError);
        throw new Error(`Failed to create teacher: ${teacherError.message}`);
      }

      teacherUserId = newTeacher.user!.id;
      console.log('✅ Created teacher user:', teacherUserId);
    }

    // Update teacher profile
    const { data: teacherProfile, error: teacherProfileError } = await supabase
      .from('teacher_profiles')
      .upsert({
        user_id: teacherUserId,
        bio: 'STEM educator passionate about accessible, personalized learning.',
        subject_specialties: ['Computer Science', 'AI Foundations']
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (teacherProfileError) {
      console.error('Error creating teacher profile:', teacherProfileError);
      throw teacherProfileError;
    }

    const teacherProfileId = teacherProfile.id;
    console.log('✅ Teacher profile created/updated:', teacherProfileId);

    // 2. Create demo student user
    console.log('👨‍🎓 Creating demo student...');
    const studentEmail = 'student_demo@tailoredu.org';
    let studentUserId: string;

    const existingStudent = existingTeacherAuth.users.find(u => u.email === studentEmail);

    if (existingStudent) {
      studentUserId = existingStudent.id;
      console.log('Student user already exists:', studentUserId);
    } else {
      const { data: newStudent, error: studentError } = await supabase.auth.admin.createUser({
        email: studentEmail,
        password: 'Demo2024!Student',
        email_confirm: true,
        user_metadata: {
          role: 'student',
          full_name: 'Jordan Lee',
          first_name: 'Jordan',
          last_name: 'Lee',
          grade_level: '9'
        }
      });

      if (studentError) {
        console.error('Error creating student:', studentError);
        throw new Error(`Failed to create student: ${studentError.message}`);
      }

      studentUserId = newStudent.user!.id;
      console.log('✅ Created student user:', studentUserId);
    }

    // Create/update student record
    const { data: studentRecord, error: studentRecordError } = await supabase
      .from('students')
      .upsert({
        user_id: studentUserId,
        first_name: 'Jordan',
        last_name: 'Lee',
        grade_level: '9',
        reading_level: 'On-grade',
        language_preference: 'en'
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (studentRecordError) {
      console.error('Error creating student record:', studentRecordError);
      throw studentRecordError;
    }

    const studentId = studentRecord.id;
    console.log('✅ Student record created/updated:', studentId);

    // 3. Create demo class
    console.log('🏫 Creating demo class...');
    const { data: demoClass, error: classError } = await supabase
      .from('classes')
      .insert({
        teacher_id: teacherProfileId,
        name: 'AI Foundations: Exploring the Future of Technology',
        subject: 'Computer Science',
        description: 'An introductory AI class where students explore how artificial intelligence impacts daily life through interactive lessons, coding exercises, and creative projects.',
        status: 'active',
        published: true,
        grade_level: '9'
      })
      .select()
      .single();

    if (classError) {
      console.error('Error creating class:', classError);
      throw classError;
    }

    const classId = demoClass.id;
    console.log('✅ Class created:', classId);

    // 4. Enroll student in class
    console.log('📝 Enrolling student in class...');
    const { error: enrollmentError } = await supabase
      .from('class_students')
      .upsert({
        class_id: classId,
        student_id: studentId,
        status: 'active'
      }, { onConflict: 'student_id,class_id' });

    if (enrollmentError) {
      console.error('Error enrolling student:', enrollmentError);
      throw enrollmentError;
    }

    console.log('✅ Student enrolled in class');

    // 5. Create Lesson 1
    console.log('📚 Creating Lesson 1: What is AI?');
    const { data: lesson1, error: lesson1Error } = await supabase
      .from('lessons')
      .insert({
        class_id: classId,
        title: 'What is Artificial Intelligence?',
        description: 'Explore the fundamentals of AI and how it impacts our daily lives',
        objectives: [
          'Define artificial intelligence',
          'Identify AI in everyday scenarios',
          'Understand basic AI concepts'
        ],
        materials: ['Computer or tablet', 'Notebook for reflections'],
        duration: 45,
        order_index: 1
      })
      .select()
      .single();

    if (lesson1Error) {
      console.error('Error creating lesson 1:', lesson1Error);
      throw lesson1Error;
    }

    console.log('✅ Lesson 1 created:', lesson1.id);

    // 6. Create Lesson 2
    console.log('📚 Creating Lesson 2: AI in Everyday Life');
    const { data: lesson2, error: lesson2Error } = await supabase
      .from('lessons')
      .insert({
        class_id: classId,
        title: 'AI in Everyday Life',
        description: 'Discover how AI powers the technology we use every day',
        objectives: [
          'Identify AI applications in daily life',
          'Understand how AI makes decisions',
          'Create a simple AI project'
        ],
        materials: ['Computer', 'Python environment', 'Project template'],
        duration: 60,
        order_index: 2
      })
      .select()
      .single();

    if (lesson2Error) {
      console.error('Error creating lesson 2:', lesson2Error);
      throw lesson2Error;
    }

    console.log('✅ Lesson 2 created:', lesson2.id);

    // 7. Create Assignment 1
    console.log('📋 Creating Assignment 1: Intro to AI Reflection');
    const dueDate1 = new Date('2025-10-30');
    const { data: assignment1, error: assignment1Error } = await supabase
      .from('class_assignments_new')
      .insert({
        class_id: classId,
        lesson_id: lesson1.id,
        title: 'Intro to AI Reflection',
        description: 'Reflect on what you learned about AI',
        instructions: 'Write a thoughtful response about where you see AI in your daily life. Include at least 2 specific examples.',
        rubric: 'Clarity (5 pts), Examples (10 pts), Understanding (5 pts)',
        due_at: dueDate1.toISOString(),
        release_at: new Date().toISOString(),
        max_points: 20,
        selected_components: []
      })
      .select()
      .single();

    if (assignment1Error) {
      console.error('Error creating assignment 1:', assignment1Error);
      throw assignment1Error;
    }

    console.log('✅ Assignment 1 created:', assignment1.id);

    // 8. Create Assignment 2
    console.log('📋 Creating Assignment 2: Everyday AI Mini Project');
    const dueDate2 = new Date('2025-11-05');
    const { data: assignment2, error: assignment2Error } = await supabase
      .from('class_assignments_new')
      .insert({
        class_id: classId,
        lesson_id: lesson2.id,
        title: 'Everyday AI Mini Project',
        description: 'Create a mini project showcasing AI in everyday life',
        instructions: 'Choose an area where AI is used (smart homes, healthcare, education, etc.) and create a presentation or document explaining how it works.',
        rubric: 'Creativity (15 pts), Technical Understanding (20 pts), Presentation (15 pts)',
        due_at: dueDate2.toISOString(),
        release_at: new Date().toISOString(),
        max_points: 50,
        selected_components: []
      })
      .select()
      .single();

    if (assignment2Error) {
      console.error('Error creating assignment 2:', assignment2Error);
      throw assignment2Error;
    }

    console.log('✅ Assignment 2 created:', assignment2.id);

    // 9. Create Submission 1
    console.log('📄 Creating submission 1...');
    const { data: submission1, error: submission1Error } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id: assignment1.id,
        user_id: studentUserId,
        status: 'submitted',
        text_response: 'I see AI in my smartphone\'s voice assistant and in Netflix recommendations. The voice assistant understands what I say and helps me set reminders, while Netflix uses AI to suggest shows based on what I\'ve watched before.',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (submission1Error) {
      console.error('Error creating submission 1:', submission1Error);
      throw submission1Error;
    }

    console.log('✅ Submission 1 created:', submission1.id);

    // 10. Create Submission 2
    console.log('📄 Creating submission 2...');
    const { data: submission2, error: submission2Error } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id: assignment2.id,
        user_id: studentUserId,
        status: 'submitted',
        text_response: 'My project explores how AI is used in smart home systems. I created a simple Python program that demonstrates how AI can learn your preferences and automatically adjust lighting and temperature.',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (submission2Error) {
      console.error('Error creating submission 2:', submission2Error);
      throw submission2Error;
    }

    console.log('✅ Submission 2 created:', submission2.id);

    // 11. Create Grade 1
    console.log('📊 Creating grade 1...');
    const { error: grade1Error } = await supabase
      .from('assignment_grades')
      .insert({
        submission_id: submission1.id,
        grader_user_id: teacherUserId,
        grade: 18,
        feedback: 'Great insight, Jordan — you explained AI\'s role in your daily life clearly!'
      });

    if (grade1Error) {
      console.error('Error creating grade 1:', grade1Error);
      throw grade1Error;
    }

    console.log('✅ Grade 1 created (18/20)');

    // 12. Create Grade 2
    console.log('📊 Creating grade 2...');
    const { error: grade2Error } = await supabase
      .from('assignment_grades')
      .insert({
        submission_id: submission2.id,
        grader_user_id: teacherUserId,
        grade: 46,
        feedback: 'Excellent coding work! Clean syntax and creative example.'
      });

    if (grade2Error) {
      console.error('Error creating grade 2:', grade2Error);
      throw grade2Error;
    }

    console.log('✅ Grade 2 created (46/50)');

    // 13. Create student reflection
    console.log('💭 Creating student reflection...');
    const { error: reflectionError } = await supabase
      .from('student_reflections')
      .insert({
        student_id: studentId,
        reflection_text: 'AI can help people learn faster when used responsibly. I\'m excited to learn more about how it works.',
        prompt_question: 'What did you learn about AI this week?'
      });

    if (reflectionError) {
      console.error('Error creating reflection:', reflectionError);
      throw reflectionError;
    }

    console.log('✅ Student reflection created');

    // 14. Create student goal
    console.log('🎯 Creating student goal...');
    const { error: goalError } = await supabase
      .from('student_goals')
      .insert({
        student_id: studentId,
        goal_text: 'Complete all AI lessons by next Friday',
        status: 'active',
        target_date: new Date('2025-11-01').toISOString()
      });

    if (goalError) {
      console.error('Error creating goal:', goalError);
      throw goalError;
    }

    console.log('✅ Student goal created');

    // 15. Create progress records
    console.log('📈 Creating progress records...');
    const { error: progress1Error } = await supabase
      .from('user_progress')
      .insert({
        user_id: studentUserId,
        lesson_id: lesson1.id,
        status: 'Completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      });

    if (progress1Error) {
      console.error('Error creating progress 1:', progress1Error);
      throw progress1Error;
    }

    const { error: progress2Error } = await supabase
      .from('user_progress')
      .insert({
        user_id: studentUserId,
        lesson_id: lesson2.id,
        status: 'In Progress',
        progress_percentage: 80
      });

    if (progress2Error) {
      console.error('Error creating progress 2:', progress2Error);
      throw progress2Error;
    }

    console.log('✅ Progress records created');

    console.log('🎉 Demo environment seeded successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo environment successfully seeded',
        data: {
          teacher: {
            email: teacherEmail,
            password: 'Demo2024!Teacher',
            name: 'Dr. Alicia Navarro',
            userId: teacherUserId
          },
          student: {
            email: studentEmail,
            password: 'Demo2024!Student',
            name: 'Jordan Lee',
            userId: studentUserId
          },
          class: {
            id: classId,
            name: 'AI Foundations: Exploring the Future of Technology'
          },
          lessons: [lesson1.id, lesson2.id],
          assignments: [assignment1.id, assignment2.id],
          submissions: [submission1.id, submission2.id],
          grades: { assignment1: '18/20 (90%)', assignment2: '46/50 (92%)' }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error seeding demo environment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
