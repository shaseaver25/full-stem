import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId } = await req.json();

    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate week range (last 7 days)
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Check if digest already exists for this week
    const { data: existingDigest } = await supabase
      .from('weekly_digests')
      .select('*')
      .eq('student_id', studentId)
      .gte('week_start', weekStart.toISOString().split('T')[0])
      .single();

    if (existingDigest) {
      return new Response(
        JSON.stringify({ digest: existingDigest, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch student data
    const { data: student } = await supabase
      .from('students')
      .select('*, profiles:user_id(full_name)')
      .eq('id', studentId)
      .single();

    if (!student) {
      throw new Error('Student not found');
    }

    // Fetch lesson progress from last week
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', studentId)
      .gte('updated_at', weekStart.toISOString())
      .lte('updated_at', weekEnd.toISOString());

    // Fetch assignment grades from last week
    const { data: grades } = await supabase
      .from('assignment_grades')
      .select(`
        *,
        submission:assignment_submissions!inner(
          user_id,
          students!inner(id)
        )
      `)
      .eq('submission.students.id', studentId)
      .gte('graded_at', weekStart.toISOString())
      .lte('graded_at', weekEnd.toISOString());

    // Fetch active goals
    const { data: goals } = await supabase
      .from('student_goals')
      .select('*')
      .eq('student_id', studentId)
      .in('status', ['not_started', 'in_progress']);

    // Fetch recent reflections
    const { data: reflections } = await supabase
      .from('student_reflections')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', weekStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    // Fetch recent AI feedback
    const { data: aiFeedback } = await supabase
      .from('ai_feedback_history')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', weekStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(2);

    // Calculate metrics
    const lessonsCompleted = progress?.filter(p => p.completion_percentage === 100).length || 0;
    const averageGrade = grades && grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
      : null;
    
    // Get previous week's average for comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const { data: prevGrades } = await supabase
      .from('assignment_grades')
      .select(`
        *,
        submission:assignment_submissions!inner(
          user_id,
          students!inner(id)
        )
      `)
      .eq('submission.students.id', studentId)
      .gte('graded_at', prevWeekStart.toISOString())
      .lt('graded_at', weekStart.toISOString());

    const prevAverageGrade = prevGrades && prevGrades.length > 0
      ? prevGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / prevGrades.length
      : null;

    const gradeImprovement = averageGrade && prevAverageGrade
      ? ((averageGrade - prevAverageGrade) / prevAverageGrade * 100).toFixed(0)
      : null;

    // Prepare prompt for AI
    const systemPrompt = `You are an encouraging AI tutor creating a weekly summary for a student. 
Be warm, supportive, and specific. Focus on growth and actionable insights.
Keep language simple and age-appropriate for ${student.grade_level || 'elementary'} level.`;

    const userPrompt = `Create a weekly digest for ${student.first_name} ${student.last_name}.

Data from this week:
- Lessons completed: ${lessonsCompleted}
- Assignments graded: ${grades?.length || 0}
- Average grade: ${averageGrade ? averageGrade.toFixed(1) : 'N/A'}
- Grade change: ${gradeImprovement ? `${gradeImprovement}%` : 'N/A'}
- Active goals: ${goals?.length || 0}
- Recent reflections: ${reflections?.length || 0}

Student profile:
- Reading level: ${student.reading_level || 'standard'}
- Language preference: ${student.language_preference || 'en'}
- Learning style: ${student.learning_style || 'mixed'}
- Interests: ${student.interests?.join(', ') || 'general'}

Recent reflections: ${reflections?.map(r => r.reflection_text).join('; ') || 'None'}
Recent AI feedback: ${aiFeedback?.map(f => f.feedback_text).join('; ') || 'None'}
Active goals: ${goals?.map(g => g.goal_text).join('; ') || 'None'}

Generate three sections:

1. SUMMARY (2-3 sentences): Highlight accomplishments, trends, and effort. Be specific with numbers.

2. NEXT_FOCUS (2-3 sentences): ${goals && goals.length > 0 
  ? 'Reference their active goals and suggest how to approach them.'
  : 'Suggest 1-2 new short-term goals based on their progress and interests.'}

3. AI_NOTE (1-2 sentences): One encouraging observation or actionable tip based on their learning patterns.

Format your response as JSON:
{
  "summary": "...",
  "next_focus": "...",
  "ai_note": "..."
}`;

    // Call Lovable AI Gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service payment required. Please contact support.');
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('Failed to generate digest');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON response
    let parsedContent;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      parsedContent = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('Invalid AI response format');
    }

    // Store digest in database
    const { data: digest, error: insertError } = await supabase
      .from('weekly_digests')
      .insert({
        student_id: studentId,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        summary_text: parsedContent.summary,
        next_focus_text: parsedContent.next_focus,
        ai_note_text: parsedContent.ai_note,
        teacher_approved: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing digest:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ digest, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-weekly-digest:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
