import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🎓 Starting demo class creation...');

    // 1. Create demo teacher user
    console.log('Creating teacher user...');
    const teacherEmail = 'teacher_demo@tailoredu.org';
    const { data: teacherAuthData, error: teacherAuthError } = await supabase.auth.admin.createUser({
      email: teacherEmail,
      password: 'Demo2024!Teacher',
      email_confirm: true,
      user_metadata: {
        role: 'teacher',
        full_name: 'Dr. Alicia Navarro',
      }
    });

    if (teacherAuthError && !teacherAuthError.message.includes('already')) {
      throw teacherAuthError;
    }

    const teacherId = teacherAuthData?.user?.id || (await supabase.auth.admin.listUsers())
      .data.users.find(u => u.email === teacherEmail)?.id;

    if (!teacherId) throw new Error('Failed to get teacher ID');

    // Update teacher profile
    await supabase.from('teacher_profiles').upsert({
      user_id: teacherId,
      bio: 'STEM educator passionate about accessible, personalized learning.',
      subject_specialties: ['Computer Science', 'AI Foundations']
    }, { onConflict: 'user_id' });

    // 2. Create demo student user
    console.log('Creating student user...');
    const studentEmail = 'student_demo@tailoredu.org';
    const { data: studentAuthData, error: studentAuthError } = await supabase.auth.admin.createUser({
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

    if (studentAuthError && !studentAuthError.message.includes('already')) {
      throw studentAuthError;
    }

    const studentUserId = studentAuthData?.user?.id || (await supabase.auth.admin.listUsers())
      .data.users.find(u => u.email === studentEmail)?.id;

    if (!studentUserId) throw new Error('Failed to get student user ID');

    // Create/update student record
    const { data: studentData } = await supabase
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

    const studentId = studentData.id;

    // 3. Create demo class
    console.log('Creating demo class...');
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', teacherId)
      .single();

    const { data: classData } = await supabase
      .from('classes')
      .insert({
        teacher_id: teacherProfile.id,
        name: 'AI Foundations: Exploring the Future of Technology',
        subject: 'Computer Science',
        description: 'An introductory AI class where students explore how artificial intelligence impacts daily life through interactive lessons, coding exercises, and creative projects.',
        status: 'active',
        published: true,
        grade_level: '9'
      })
      .select()
      .single();

    const classId = classData.id;

    // 4. Enroll student in class
    console.log('Enrolling student...');
    await supabase.from('class_students').upsert({
      class_id: classId,
      student_id: studentId,
      status: 'active'
    }, { onConflict: 'student_id,class_id' });

    // 5. Create Lesson 1: "What is Artificial Intelligence?"
    console.log('Creating Lesson 1...');
    const { data: lesson1 } = await supabase
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

    // Add components to Lesson 1
    await supabase.from('lesson_components').insert([
      {
        lesson_id: lesson1.id,
        component_type: 'text',
        order: 1,
        content: {
          text: 'Artificial Intelligence (AI) refers to computer systems that can perform tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, and understanding language.'
        },
        read_aloud: true
      },
      {
        lesson_id: lesson1.id,
        component_type: 'video',
        order: 2,
        content: {
          url: 'https://www.youtube.com/watch?v=kWmX3pd1f10',
          title: 'How AI Works for Beginners'
        }
      },
      {
        lesson_id: lesson1.id,
        component_type: 'quiz',
        order: 3,
        content: {
          questions: [
            {
              question: 'What is artificial intelligence?',
              options: [
                'Computer systems that mimic human intelligence',
                'A type of robot',
                'A video game',
                'A programming language'
              ],
              correct: 0
            },
            {
              question: 'Which is an example of AI in daily life?',
              options: [
                'A light switch',
                'Voice assistants like Siri or Alexa',
                'A calculator',
                'A bicycle'
              ],
              correct: 1
            },
            {
              question: 'AI systems can:',
              options: [
                'Only do math',
                'Learn from data and improve over time',
                'Replace all human jobs',
                'Only work with robots'
              ],
              correct: 1
            }
          ]
        }
      },
      {
        lesson_id: lesson1.id,
        component_type: 'reflection',
        order: 4,
        content: {
          prompt: 'Where do you see AI in your life? Write about at least 2 examples.'
        }
      }
    ]);

    // 6. Create Lesson 2: "AI in Everyday Life"
    console.log('Creating Lesson 2...');
    const { data: lesson2 } = await supabase
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

    // Add components to Lesson 2
    await supabase.from('lesson_components').insert([
      {
        lesson_id: lesson2.id,
        component_type: 'text',
        order: 1,
        content: {
          text: 'AI is everywhere in our modern world. From smart homes that adjust temperature automatically, to cars that can drive themselves, AI is transforming how we live and work.'
        },
        read_aloud: true
      },
      {
        lesson_id: lesson2.id,
        component_type: 'image',
        order: 2,
        content: {
          images: [
            {
              url: 'https://images.unsplash.com/photo-1558002038-1055907df827',
              caption: 'Smart home AI systems'
            },
            {
              url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2',
              caption: 'Autonomous vehicles'
            }
          ]
        }
      },
      {
        lesson_id: lesson2.id,
        component_type: 'code',
        order: 3,
        content: {
          language: 'python',
          code: '# Simple AI decision-making example\ndef make_recommendation(user_preferences):\n    if "science" in user_preferences:\n        return "Check out our AI courses!"\n    elif "art" in user_preferences:\n        return "Explore AI in creative design!"\n    return "Discover how AI can help you!"',
          description: 'A basic example of how AI makes recommendations'
        }
      },
      {
        lesson_id: lesson2.id,
        component_type: 'assignment',
        order: 4,
        content: {
          instructions: 'Create a mini project showing how AI is used in an area that interests you. This can be a presentation, document, or simple code example.'
        }
      }
    ]);

    // 7. Create assignments
    console.log('Creating assignments...');
    
    // Assignment 1: Intro to AI Reflection
    const dueDate1 = new Date('2025-10-30');
    const { data: assignment1 } = await supabase
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

    // Assignment 2: Everyday AI Mini Project
    const dueDate2 = new Date('2025-11-05');
    const { data: assignment2 } = await supabase
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

    // 8. Create submissions
    console.log('Creating submissions...');
    const { data: submission1 } = await supabase
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

    const { data: submission2 } = await supabase
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

    // 9. Create grades
    console.log('Creating grades...');
    await supabase.from('assignment_grades').insert([
      {
        submission_id: submission1.id,
        grader_user_id: teacherId,
        grade: 18,
        feedback: 'Great insight, Jordan — you explained AI\'s role in your daily life clearly!'
      },
      {
        submission_id: submission2.id,
        grader_user_id: teacherId,
        grade: 46,
        feedback: 'Excellent coding work! Clean syntax and creative example.'
      }
    ]);

    // 10. Create student reflections and goals
    console.log('Creating reflections and goals...');
    await supabase.from('student_reflections').insert({
      student_id: studentId,
      reflection_text: 'AI can help people learn faster when used responsibly. I\'m excited to learn more about how it works.',
      prompt_question: 'What did you learn about AI this week?'
    });

    await supabase.from('student_goals').insert([
      {
        student_id: studentId,
        goal_text: 'Complete all AI lessons by next Friday',
        status: 'active',
        target_date: new Date('2025-11-01').toISOString()
      }
    ]);

    // 11. Create progress records
    console.log('Creating progress records...');
    await supabase.from('user_progress').insert([
      {
        user_id: studentUserId,
        lesson_id: lesson1.id,
        status: 'Completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      },
      {
        user_id: studentUserId,
        lesson_id: lesson2.id,
        status: 'In Progress',
        progress_percentage: 80
      }
    ]);

    console.log('✅ Demo class created successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo class environment created successfully',
        data: {
          teacher: {
            email: teacherEmail,
            password: 'Demo2024!Teacher',
            name: 'Dr. Alicia Navarro'
          },
          student: {
            email: studentEmail,
            password: 'Demo2024!Student',
            name: 'Jordan Lee'
          },
          class: {
            id: classId,
            name: 'AI Foundations: Exploring the Future of Technology'
          },
          lessons: [lesson1.id, lesson2.id],
          assignments: [assignment1.id, assignment2.id]
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating demo class:', error);
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
