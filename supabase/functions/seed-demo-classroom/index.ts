import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEMO_SUBMISSIONS = {
  photosynthesis: [
    {
      name: 'Emma Rodriguez',
      level: 'advanced',
      text: 'Photosynthesis is the process where plants convert light energy into chemical energy. The inputs are carbon dioxide (CO2) from the air, water (H2O) from the roots, and sunlight energy. Inside the chloroplasts, specifically in the chlorophyll, light energy breaks apart water molecules in a process called photolysis. This releases oxygen as a byproduct. The plant then uses the hydrogen from water and carbon from CO2 to create glucose (C6H12O6), which is stored energy. The outputs are glucose for the plant\'s food and oxygen that we breathe. This process happens in two stages: light-dependent reactions and the Calvin cycle.'
    },
    {
      name: 'Marcus Chen',
      level: 'advanced',
      text: 'Plants make their own food through photosynthesis, which happens in the chloroplasts of their leaves. The light-dependent reactions use sunlight to split water molecules, releasing oxygen and creating ATP and NADPH. Then in the Calvin cycle (light-independent reactions), the plant uses CO2 from the air plus the ATP and NADPH to build glucose molecules. The formula is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. This means 6 molecules of carbon dioxide plus 6 molecules of water plus light makes 1 molecule of glucose and 6 molecules of oxygen. Without photosynthesis, there would be no oxygen for animals to breathe and no food chain.'
    },
    {
      name: 'Aisha Patel',
      level: 'advanced',
      text: 'Photosynthesis converts solar energy to chemical energy that plants use for growth. In the thylakoid membranes of chloroplasts, chlorophyll pigments absorb light energy. Water molecules split (photolysis), releasing oxygen and hydrogen. The hydrogen combines with CO2 in the stroma during the Calvin cycle to produce glucose. Key inputs: sunlight, H2O, CO2. Key outputs: C6H12O6 (glucose), O2 (oxygen). Limiting factors include light intensity, CO2 concentration, and temperature. This process is vital for all life on Earth as it\'s the base of food chains and provides atmospheric oxygen.'
    },
    {
      name: 'Jake Wilson',
      level: 'proficient',
      text: 'Photosynthesis is when plants make food from sunlight. The inputs are sunlight, water, and carbon dioxide. The plant uses chlorophyll in its leaves to capture the sun\'s energy. Water comes from the roots, and carbon dioxide comes from the air through tiny holes called stomata. The plant uses this energy to combine water and CO2 to make glucose, which is a type of sugar. The outputs are glucose (food for the plant) and oxygen (which we breathe). The chemical equation is 6CO2 + 6H2O + light → C6H12O6 + 6O2. This happens in the chloroplasts.'
    },
    {
      name: 'Sofia Martinez',
      level: 'proficient',
      text: 'Plants make their own food using photosynthesis. They need three things: sunlight for energy, water from the soil, and carbon dioxide from the air. Inside the chloroplasts in the leaves, the chlorophyll uses the sun\'s energy to turn water and carbon dioxide into glucose. Glucose is the food/energy the plant needs to grow. Oxygen is released as waste, which is good for us because we breathe it. The process has two stages - the light reactions that need sun, and the dark reactions that don\'t need sun but use what the light reactions made.'
    },
    {
      name: 'Tyler Anderson',
      level: 'proficient',
      text: 'Photosynthesis happens in plant leaves in structures called chloroplasts. The plant takes in CO2, H2O, and sunlight. The chlorophyll pigment absorbs the light energy. Through chemical reactions, the plant converts these inputs into glucose (C6H12O6) and releases oxygen (O2). The glucose provides energy for the plant\'s cells and helps it grow. Humans and animals depend on both the oxygen and the plants for food. Without photosynthesis, life on Earth wouldn\'t exist. The formula is: carbon dioxide + water + light energy = glucose + oxygen.'
    },
    {
      name: 'Maya Johnson',
      level: 'proficient',
      text: 'Photosynthesis is how plants create food. Inputs: sunlight (energy source), water (H2O from roots), carbon dioxide (CO2 from air through stomata). The chlorophyll in leaves captures light energy and uses it to split water molecules. The plant combines the hydrogen from water with carbon from CO2 to make glucose sugar. Outputs: glucose (C6H12O6) for plant nutrition and growth, plus oxygen (O2) released into air. This takes place in chloroplasts. It\'s important because plants are the base of food chains and produce the oxygen we need to survive.'
    },
    {
      name: 'Ethan Brown',
      level: 'proficient',
      text: 'Plants use photosynthesis to make food from sunlight, water, and carbon dioxide. The chloroplasts contain chlorophyll which absorbs light. Water molecules break apart, releasing oxygen. The plant uses energy from light to build glucose molecules from CO2 and H. The equation shows 6 carbon dioxide plus 6 water plus light equals 1 glucose plus 6 oxygen. Outputs are glucose for energy and oxygen for breathing. The process occurs in two phases: light reactions in thylakoids and Calvin cycle in stroma. Temperature and light affect how fast photosynthesis happens.'
    },
    {
      name: 'Olivia Davis',
      level: 'developing',
      text: 'Photosynthesis is when plants make food from sunlight. They use chlorophyll in their leaves to capture sunlight. Plants also need water and carbon dioxide. The sunlight helps turn the water and carbon dioxide into glucose which is food for the plant. Oxygen comes out as a waste product. This is important because plants give us oxygen to breathe and are food for animals. It happens in the chloroplasts inside plant cells.'
    },
    {
      name: 'Noah Garcia',
      level: 'developing',
      text: 'Plants make food through photosynthesis. They need sunlight, water from the ground, and carbon dioxide from the air. The green color in leaves called chlorophyll helps catch the sunlight. The plant uses energy from sun to change water and CO2 into sugar called glucose. The plant uses this sugar for energy and growth. Oxygen is released into the air which is good for us. The formula is CO2 + H2O + light = glucose + O2.'
    },
    {
      name: 'Isabella Lee',
      level: 'developing',
      text: 'Photosynthesis is how plants eat. Plants need three things: sun, water, and carbon dioxide. The leaves have chlorophyll that makes them green and catches sunlight. The plant combines water and air (CO2) using the sun\'s energy to make food (glucose). It also makes oxygen which comes out of the leaves. This happens in parts of the cell called chloroplasts. We need plants because they make oxygen for us to breathe and food for us to eat.'
    },
    {
      name: 'Liam Taylor',
      level: 'developing',
      text: 'Photosynthesis makes plants grow. Sunlight goes into the leaves. The plant also gets water from its roots and carbon dioxide from air. Inside the chloroplasts, chlorophyll uses the sunlight to turn water and CO2 into food. The food is glucose. Oxygen is made too and the plant lets it out. We breathe the oxygen. Plants are important because they are the start of the food chain. The process needs light, so it stops at night.'
    },
    {
      name: 'Ava White',
      level: 'developing',
      text: 'Plants use photosynthesis to make food from the sun. They need sunlight, water, and carbon dioxide. The chlorophyll in the leaves catches the sun. Then the plant makes glucose from the water and CO2. Glucose is the food/energy. Oxygen comes out and goes into the air for us to breathe. It happens in chloroplasts. The chemical formula shows what goes in and what comes out: 6CO2 + 6H2O + light → C6H12O6 + 6O2. All living things depend on photosynthesis.'
    },
    {
      name: 'Mia Martinez',
      level: 'emerging',
      text: 'Photosynthesis is when plants make food. They need sunlight and water. The leaves are green because of chlorophyll. Plants take in carbon dioxide and make oxygen. The oxygen is what we breathe. Glucose is the food they make. It\'s important for plants to grow.'
    },
    {
      name: 'Lucas Anderson',
      level: 'emerging',
      text: 'Plants need sun to make food. They also need water and air. The green in the leaves helps. Plants make sugar and oxygen. We need the oxygen to breathe. Plants use photosynthesis to live and grow. Without plants we wouldn\'t have air.'
    }
  ]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { reset = false } = await req.json()

    // If reset, delete existing demo data
    if (reset) {
      console.log('Resetting demo data...')
      
      // Delete in order to avoid foreign key constraints
      await supabase.from('submission_analyses').delete().ilike('assignment_id', 'demo_%')
      await supabase.from('assignment_submissions').delete().ilike('assignment_id', 'demo_%')
      await supabase.from('class_assignments_new').delete().ilike('id', 'demo_%')
      await supabase.from('class_students').delete().ilike('class_id', 'demo_%')
      await supabase.from('students').delete().ilike('id', 'demo_%')
      await supabase.from('classes').delete().ilike('id', 'demo_%')
      await supabase.from('teacher_profiles').delete().ilike('id', 'demo_%')
      
      console.log('Demo data reset complete')
    }

    console.log('Creating demo teacher...')
    
    // Create demo teacher profile
    const teacherId = 'demo_teacher_001'
    const { error: teacherError } = await supabase
      .from('teacher_profiles')
      .upsert({
        id: teacherId,
        user_id: teacherId,
        first_name: 'Sarah',
        last_name: 'Johnson',
        onboarding_completed: true
      })

    if (teacherError) {
      console.error('Error creating teacher:', teacherError)
      throw teacherError
    }

    console.log('Creating demo class...')
    
    // Create demo class
    const classId = 'demo_class_001'
    const { error: classError } = await supabase
      .from('classes')
      .upsert({
        id: classId,
        name: '5th Grade Science - Room 204',
        subject: 'Science',
        grade_level: '5',
        teacher_id: teacherId,
        published: true,
        status: 'active'
      })

    if (classError) {
      console.error('Error creating class:', classError)
      throw classError
    }

    console.log('Creating demo students...')
    
    // Create 15 demo students
    const studentData = DEMO_SUBMISSIONS.photosynthesis.map((submission, index) => ({
      id: `demo_student_${String(index + 1).padStart(3, '0')}`,
      user_id: `demo_student_${String(index + 1).padStart(3, '0')}`,
      first_name: submission.name.split(' ')[0],
      last_name: submission.name.split(' ')[1],
      grade_level: '5'
    }))

    const { error: studentsError } = await supabase
      .from('students')
      .upsert(studentData)

    if (studentsError) {
      console.error('Error creating students:', studentsError)
      throw studentsError
    }

    console.log('Enrolling students in class...')
    
    // Enroll students in class
    const enrollmentData = studentData.map(student => ({
      class_id: classId,
      student_id: student.id,
      status: 'active'
    }))

    const { error: enrollmentError } = await supabase
      .from('class_students')
      .upsert(enrollmentData)

    if (enrollmentError) {
      console.error('Error enrolling students:', enrollmentError)
      throw enrollmentError
    }

    console.log('Creating demo assignments...')
    
    // Create 3 assignments
    const assignments = [
      {
        id: 'demo_assignment_001',
        class_id: classId,
        title: 'Photosynthesis Explanation',
        description: 'Explain how plants make food from sunlight.',
        instructions: 'Explain how plants make food from sunlight. Include the inputs (what goes in), the process (what happens), and the outputs (what comes out). Use at least 3 scientific terms.',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        max_points: 100,
        rubric: JSON.stringify({
          criteria: [
            { name: 'Scientific Accuracy', points: 25, description: 'Correct scientific information' },
            { name: 'Completeness', points: 25, description: 'Includes inputs, process, and outputs' },
            { name: 'Use of Scientific Terms', points: 25, description: 'Uses at least 3 scientific terms correctly' },
            { name: 'Clarity', points: 25, description: 'Clear and organized explanation' }
          ]
        }),
        options: {}
      },
      {
        id: 'demo_assignment_002',
        class_id: classId,
        title: 'Water Cycle Diagram & Description',
        description: 'Explain the water cycle.',
        instructions: 'Draw or describe the water cycle. Explain evaporation, condensation, precipitation, and collection.',
        due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        max_points: 100,
        options: {}
      },
      {
        id: 'demo_assignment_003',
        class_id: classId,
        title: 'Animal Adaptations Essay',
        description: 'Explain animal adaptations.',
        instructions: 'Choose an animal and explain how its physical features help it survive in its environment. Give at least 3 examples.',
        due_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        max_points: 100,
        options: {}
      }
    ]

    const { error: assignmentsError } = await supabase
      .from('class_assignments_new')
      .upsert(assignments)

    if (assignmentsError) {
      console.error('Error creating assignments:', assignmentsError)
      throw assignmentsError
    }

    console.log('Creating demo submissions...')
    
    // Create submissions for Assignment 1
    const submissionData = DEMO_SUBMISSIONS.photosynthesis.map((submission, index) => ({
      assignment_id: 'demo_assignment_001',
      user_id: `demo_student_${String(index + 1).padStart(3, '0')}`,
      text_response: submission.text,
      status: 'submitted',
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }))

    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .upsert(submissionData)
      .select()

    if (submissionsError) {
      console.error('Error creating submissions:', submissionsError)
      throw submissionsError
    }

    console.log(`Created ${submissions?.length || 0} submissions`)

    // Trigger analysis for each submission
    console.log('Triggering AI analysis for all submissions...')
    
    let analyzed = 0
    let errors = 0

    for (const submission of submissions || []) {
      try {
        const { error: analyzeError } = await supabase.functions.invoke(
          'analyze-submission',
          {
            body: {
              submissionId: submission.id,
              assignmentId: submission.assignment_id
            }
          }
        )

        if (analyzeError) {
          console.error(`Error analyzing submission ${submission.id}:`, analyzeError)
          errors++
        } else {
          analyzed++
          console.log(`✓ Analyzed submission ${analyzed}/${submissions.length}`)
        }
      } catch (error) {
        console.error(`Error analyzing submission ${submission.id}:`, error)
        errors++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo classroom created successfully',
        stats: {
          teacher: 1,
          class: 1,
          students: studentData.length,
          assignments: assignments.length,
          submissions: submissions?.length || 0,
          analyzed,
          errors
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in seed-demo-classroom:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
