import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { assignmentId } = await req.json()

    // Student data with user_ids
    const students = [
      {
        name: 'Emma Rodriguez',
        user_id: '15f57ae1-e33b-478a-879b-f22d67bd6a2d',
        level: 'Advanced',
        text: 'Photosynthesis is the process where plants convert light energy into chemical energy. The inputs are carbon dioxide (CO2) from the air, water (H2O) from the roots, and sunlight energy. Inside the chloroplasts, specifically in the chlorophyll, light energy breaks apart water molecules in a process called photolysis. This releases oxygen as a byproduct. The plant then uses the hydrogen from water and carbon from CO2 to create glucose (C6H12O6), which is stored energy. The outputs are glucose for the plant\'s food and oxygen that we breathe. This process happens in two stages: light-dependent reactions and the Calvin cycle.'
      },
      {
        name: 'Marcus Chen',
        user_id: '0219f5b6-a79f-4a20-b489-b7c96ab15ef5',
        level: 'Proficient',
        text: 'Photosynthesis is when plants make food from sunlight. The inputs are sunlight, water, and carbon dioxide. The plant uses chlorophyll in its leaves to capture the sun\'s energy. Water comes from the roots, and carbon dioxide comes from the air through tiny holes called stomata. The plant uses this energy to combine water and CO2 to make glucose, which is a type of sugar. The outputs are glucose (food for the plant) and oxygen (which we breathe). The chemical equation is 6CO2 + 6H2O + light → C6H12O6 + 6O2. This happens in the chloroplasts.'
      },
      {
        name: 'Olivia Davis',
        user_id: '52ade501-eb4d-4211-91a4-66e5f3e15837',
        level: 'Developing',
        text: 'Photosynthesis is when plants make food from sunlight. They use chlorophyll in their leaves to capture sunlight. Plants also need water and carbon dioxide. The sunlight helps turn the water and carbon dioxide into glucose which is food for the plant. Oxygen comes out as a waste product. This is important because plants give us oxygen to breathe and are food for animals. It happens in the chloroplasts inside plant cells.'
      },
      {
        name: 'Noah Garcia',
        user_id: 'd2056feb-815f-481c-b38a-1f46ee51b162',
        level: 'Developing',
        text: 'Plants make food through photosynthesis. They need sunlight, water from the ground, and carbon dioxide from the air. The green color in leaves called chlorophyll helps catch the sunlight. The plant uses energy from sun to change water and CO2 into sugar called glucose. The plant uses this sugar for energy and growth. Oxygen is released into the air which is good for us. The formula is CO2 + H2O + light = glucose + O2.'
      },
      {
        name: 'Mia Martinez',
        user_id: '81d9a17d-2860-4719-8a09-b8e3cdd902c1',
        level: 'Emerging',
        text: 'Photosynthesis is when plants make food. They need sunlight and water. The leaves are green because of chlorophyll. Plants take in carbon dioxide and make oxygen. The oxygen is what we breathe. Glucose is the food they make. It\'s important for plants to grow.'
      }
    ]

    // Calculate submitted_at as 2 days ago
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    // Insert all submissions
    const submissions = students.map(student => ({
      assignment_id: assignmentId,
      user_id: student.user_id,
      text_response: student.text,
      status: 'submitted',
      submitted_at: twoDaysAgo.toISOString()
    }))

    const { data, error } = await supabaseClient
      .from('assignment_submissions')
      .insert(submissions)
      .select('id, user_id')

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        submissions: data,
        count: data.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
