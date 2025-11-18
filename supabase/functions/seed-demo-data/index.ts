import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin']);

    if (!roles || roles.length === 0) {
      throw new Error('Admin access required');
    }

    const { demo_tenant = 'tailoredu-demo', force_reset = false } = await req.json();

    console.log(`🌱 Seeding demo data for tenant: ${demo_tenant}`);

    // Optional: Clear existing demo data if force_reset
    if (force_reset) {
      console.log('🗑️ Clearing existing demo data...');
      // Add cleanup logic here if needed
    }

    // -----------------------
    // 1️⃣ Create Demo Teachers
    // -----------------------
    console.log('👨‍🏫 Creating demo teachers...');
    
    const teacherUsers = [
      { email: 'johnson@demo.tailoredu.com', full_name: 'Mr. Johnson', password: 'Demo123!@#' },
      { email: 'nguyen@demo.tailoredu.com', full_name: 'Ms. Nguyen', password: 'Demo123!@#' },
      { email: 'abdi@demo.tailoredu.com', full_name: 'Mr. Abdi', password: 'Demo123!@#' },
    ];

    const teacherIds = [];
    for (const teacher of teacherUsers) {
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: teacher.email,
        password: teacher.password,
        email_confirm: true,
        user_metadata: {
          full_name: teacher.full_name,
          role: 'teacher'
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('Error creating teacher:', signUpError);
        continue;
      }

      const userId = authData?.user?.id;
      if (userId) {
        teacherIds.push(userId);

        // Create profile
        await supabase.from('profiles').upsert({
          id: userId,
          email: teacher.email,
          full_name: teacher.full_name,
        });

        // Create teacher profile
        await supabase.from('teacher_profiles').upsert({
          user_id: userId,
        });

        // Assign teacher role
        await supabase.from('user_roles').upsert({
          user_id: userId,
          role: 'teacher'
        });
      }
    }

    // -----------------------
    // 2️⃣ Create Demo Students
    // -----------------------
    console.log('👨‍🎓 Creating demo students...');
    
    const studentData = [
      { first: "Mai", last: "Lor", lang: "hmn", grade: 7 },
      { first: "Hodan", last: "Ali", lang: "so", grade: 8 },
      { first: "Luis", last: "Rivera", lang: "es", grade: 7 },
      { first: "Eli", last: "Tran", lang: "vi", grade: 9 },
      { first: "Asha", last: "Osman", lang: "so", grade: 8 },
      { first: "Noor", last: "Ahmed", lang: "so", grade: 9 },
      { first: "Maya", last: "Nguyen", lang: "vi", grade: 7 },
      { first: "Jamal", last: "Abdi", lang: "so", grade: 8 },
      { first: "Fatima", last: "Yusuf", lang: "so", grade: 9 },
      { first: "Daniel", last: "Carter", lang: "en", grade: 7 },
      { first: "Sofia", last: "Garcia", lang: "es", grade: 8 },
      { first: "Ahmed", last: "Hassan", lang: "ar", grade: 9 },
      { first: "Lily", last: "Chen", lang: "zh", grade: 7 },
      { first: "Marcus", last: "Johnson", lang: "en", grade: 8 },
      { first: "Amina", last: "Mohamed", lang: "so", grade: 9 },
    ];

    const studentIds = [];
    for (const student of studentData) {
      const email = `${student.first.toLowerCase()}.${student.last.toLowerCase()}@demo.student.com`;
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password: 'Demo123!@#',
        email_confirm: true,
        user_metadata: {
          first_name: student.first,
          last_name: student.last,
          grade_level: student.grade.toString(),
          role: 'student'
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('Error creating student:', signUpError);
        continue;
      }

      const userId = authData?.user?.id;
      if (userId) {
        studentIds.push(userId);

        // Create profile
        await supabase.from('profiles').upsert({
          id: userId,
          email,
          full_name: `${student.first} ${student.last}`,
        });

        // Create student record
        await supabase.from('students').upsert({
          user_id: userId,
          first_name: student.first,
          last_name: student.last,
          grade_level: student.grade.toString(),
          language_preference: student.lang,
          reading_level: Math.floor(Math.random() * 3) + student.grade, // Reading level around grade level
        });

        // Assign student role
        await supabase.from('user_roles').upsert({
          user_id: userId,
          role: 'student'
        });
      }
    }

    // -----------------------
    // 3️⃣ Create Classes
    // -----------------------
    console.log('🏫 Creating demo classes...');
    
    const classData = [
      { title: "STEM Foundations", description: "Introduction to Science, Technology, Engineering, and Math", teacher_idx: 0, track: "Excel" },
      { title: "AI & Machine Learning", description: "Exploring artificial intelligence concepts", teacher_idx: 1, track: "PowerPoint" },
      { title: "Robotics Workshop", description: "Hands-on robotics and programming", teacher_idx: 2, track: "Word" },
    ];

    const classIds = [];
    for (const classInfo of classData) {
      const teacherId = teacherIds[classInfo.teacher_idx];
      if (!teacherId) continue;

      // Get teacher profile id
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', teacherId)
        .single();

      if (teacherProfile) {
        const { data: newClass } = await supabase.from('classes').insert({
          title: classInfo.title,
          description: classInfo.description,
          teacher_id: teacherProfile.id,
          published: true,
          subject: 'STEM',
        }).select().single();

        if (newClass) {
          classIds.push(newClass.id);

          // Enroll random students
          const studentsToEnroll = studentIds.slice(0, 5 + Math.floor(Math.random() * 5));
          for (const studentUserId of studentsToEnroll) {
            const { data: studentRecord } = await supabase
              .from('students')
              .select('id')
              .eq('user_id', studentUserId)
              .single();

            if (studentRecord) {
              await supabase.from('class_students').insert({
                class_id: newClass.id,
                student_id: studentRecord.id,
                status: 'active'
              });
            }
          }
        }
      }
    }

    // -----------------------
    // 4️⃣ Create Assignments
    // -----------------------
    console.log('📝 Creating demo assignments...');
    
    const assignmentTitles = [
      "Simple Machines Project",
      "AI Ethics Essay",
      "Robot Design Presentation",
      "Data Analysis Challenge",
      "Coding Exercise: Loops",
    ];

    const feedbackOptions = [
      "Excellent work! Keep refining your explanations.",
      "Good effort—try adding more real-world examples.",
      "Strong start! Clarify your main idea in the conclusion.",
      "Creative thinking shown throughout this project.",
      "Great improvement from last time—keep it up!",
    ];

    const aiFeedbackOptions = [
      "Consider simplifying your introduction for better clarity.",
      "Add a diagram to support your main points.",
      "Focus more on explaining cause and effect relationships.",
      "Try breaking your paragraphs into shorter, focused sections.",
      "Include one more example to strengthen your argument.",
    ];

    for (let i = 0; i < classIds.length; i++) {
      const classId = classIds[i];
      
      // Create assignment
      const { data: assignment } = await supabase.from('class_assignments_new').insert({
        class_id: classId,
        title: assignmentTitles[i % assignmentTitles.length],
        description: `Demo assignment for ${classData[i].title}`,
        instructions: "Complete this assignment following the guidelines discussed in class.",
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_points: 100,
      }).select().single();

      if (assignment) {
        // Get enrolled students
        const { data: enrolledStudents } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', classId)
          .eq('status', 'active');

        // Create submissions for each student
        if (enrolledStudents) {
          for (const enrollment of enrolledStudents) {
            const { data: student } = await supabase
              .from('students')
              .select('user_id')
              .eq('id', enrollment.student_id)
              .single();

            if (student?.user_id) {
              const grade = 65 + Math.floor(Math.random() * 35);
              await supabase.from('assignment_submissions').insert({
                assignment_id: assignment.id,
                user_id: student.user_id,
                status: Math.random() > 0.3 ? 'submitted' : 'assigned',
                submitted_at: Math.random() > 0.3 ? new Date().toISOString() : null,
                text_response: "This is a demo submission with sample content.",
                ai_feedback: aiFeedbackOptions[Math.floor(Math.random() * aiFeedbackOptions.length)],
              });
            }
          }
        }
      }
    }

    // -----------------------
    // 5️⃣ Log Activity
    // -----------------------
    console.log('📊 Logging activity...');
    
    // Note: Assumes demo_activity_logs table exists
    try {
      await supabase.from('demo_activity_logs').insert({
        user_id: user.id,
        tenant: demo_tenant,
        action: 'seed_demo_data',
      });
    } catch (logError) {
      console.warn('Could not log activity (table may not exist):', logError);
    }

    // -----------------------
    // ✅ Done
    // -----------------------
    console.log("✅ Demo data seeded successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Demo data created successfully",
        counts: {
          teachers: teacherIds.length,
          students: studentIds.length,
          classes: classIds.length,
        }
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
