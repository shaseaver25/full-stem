import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { classId, variant = 'teacher' } = await req.json();

    if (!classId) {
      throw new Error('Class ID is required');
    }

    if (!['teacher', 'student', 'parent'].includes(variant)) {
      throw new Error('Invalid variant. Must be teacher, student, or parent');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate week range
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Check if digest exists for this week
    const { data: existingDigest } = await supabase
      .from('class_weekly_digests')
      .select('*')
      .eq('class_id', classId)
      .eq('variant', variant)
      .gte('week_start', weekStart.toISOString().split('T')[0])
      .maybeSingle();

    if (existingDigest) {
      return new Response(
        JSON.stringify({ digest: existingDigest, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch class data
    const { data: classData } = await supabase
      .from('classes')
      .select('*, teacher_profiles!inner(user_id, profiles:user_id(full_name))')
      .eq('id', classId)
      .single();

    if (!classData) {
      throw new Error('Class not found');
    }

    // Get students in class
    const { data: classStudents } = await supabase
      .from('class_students')
      .select('student_id, students!inner(*)')
      .eq('class_id', classId)
      .eq('status', 'active');

    const studentIds = classStudents?.map(cs => cs.student_id) || [];
    const totalStudents = studentIds.length;

    if (totalStudents === 0) {
      throw new Error('No students enrolled in this class');
    }

    // Fetch lesson progress for this week
    const { data: thisWeekProgress } = await supabase
      .from('lesson_progress')
      .select('*')
      .in('student_id', studentIds)
      .gte('updated_at', weekStart.toISOString())
      .lte('updated_at', weekEnd.toISOString());

    // Fetch lesson progress for last week (for comparison)
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const { data: lastWeekProgress } = await supabase
      .from('lesson_progress')
      .select('*')
      .in('student_id', studentIds)
      .gte('updated_at', lastWeekStart.toISOString())
      .lt('updated_at', weekStart.toISOString());

    // Fetch assignment submissions for this week
    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:class_assignments_new!inner(
          id, title, due_at, class_id,
          students:assignment_submissions(user_id)
        ),
        grades:assignment_grades(grade, graded_at)
      `)
      .eq('assignment.class_id', classId)
      .gte('updated_at', weekStart.toISOString());

    // Fetch goals for students in this class
    const { data: goals } = await supabase
      .from('student_goals')
      .select('*')
      .in('student_id', studentIds);

    // Fetch reflections for this week
    const { data: reflections } = await supabase
      .from('student_reflections')
      .select('*')
      .in('student_id', studentIds)
      .gte('created_at', weekStart.toISOString());

    // Calculate KPIs
    const avgProgressThisWeek = thisWeekProgress && thisWeekProgress.length > 0
      ? thisWeekProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / thisWeekProgress.length
      : 0;

    const avgProgressLastWeek = lastWeekProgress && lastWeekProgress.length > 0
      ? lastWeekProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / lastWeekProgress.length
      : 0;

    const gradedSubmissions = submissions?.filter(s => s.grades && s.grades.length > 0) || [];
    const medianScore = gradedSubmissions.length > 0
      ? gradedSubmissions.map(s => s.grades[0].grade).sort((a, b) => a - b)[Math.floor(gradedSubmissions.length / 2)]
      : null;

    const onTimeSubmissions = submissions?.filter(s => 
      s.submitted_at && s.assignment?.due_at && 
      new Date(s.submitted_at) <= new Date(s.assignment.due_at)
    ).length || 0;
    const onTimeRate = submissions && submissions.length > 0 
      ? (onTimeSubmissions / submissions.length * 100).toFixed(0)
      : 0;

    const lateSubmissions = submissions?.filter(s => 
      s.submitted_at && s.assignment?.due_at && 
      new Date(s.submitted_at) > new Date(s.assignment.due_at)
    ).length || 0;

    const missingSubmissions = submissions?.filter(s => 
      !s.submitted_at && s.assignment?.due_at && 
      new Date(s.assignment.due_at) < new Date()
    ).length || 0;

    const reflectionRate = totalStudents > 0 
      ? ((reflections?.length || 0) / totalStudents * 100).toFixed(0)
      : 0;

    const activeGoals = goals?.filter(g => g.status === 'in_progress' || g.status === 'not_started') || [];
    const completedGoals = goals?.filter(g => g.status === 'completed') || [];
    const goalCompletionRate = goals && goals.length > 0
      ? (completedGoals.length / goals.length * 100).toFixed(0)
      : 0;

    // Identify at-risk students
    const atRiskStudents: any[] = [];
    for (const cs of classStudents || []) {
      const student = cs.students;
      const studentSubmissions = submissions?.filter(s => s.user_id === student.user_id) || [];
      const missedCount = studentSubmissions.filter(s => 
        !s.submitted_at && s.assignment?.due_at && 
        new Date(s.assignment.due_at) < new Date()
      ).length;

      const studentProgress = thisWeekProgress?.filter(p => p.student_id === student.id) || [];
      const lastStudentProgress = lastWeekProgress?.filter(p => p.student_id === student.id) || [];
      
      const currentAvg = studentProgress.length > 0
        ? studentProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / studentProgress.length
        : 0;
      const lastAvg = lastStudentProgress.length > 0
        ? lastStudentProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / lastStudentProgress.length
        : currentAvg;

      const trend = lastAvg > 0 ? ((currentAvg - lastAvg) / lastAvg * 100) : 0;
      const stalledProgress = studentProgress.length === 0 && lastStudentProgress.length > 0;

      if (trend < -10 || missedCount >= 2 || stalledProgress) {
        atRiskStudents.push({
          name: `${student.first_name} ${student.last_name}`,
          reasons: [
            ...(trend < -10 ? [`${Math.abs(trend).toFixed(0)}% progress drop`] : []),
            ...(missedCount >= 2 ? [`${missedCount} missing assignments`] : []),
            ...(stalledProgress ? ['No progress in 7+ days'] : []),
          ],
          iep: student.iep_accommodations && student.iep_accommodations.length > 0,
          ell: student.language_preference && student.language_preference !== 'en',
        });
      }
    }

    // Identify top improvers
    const improvers: any[] = [];
    for (const cs of classStudents || []) {
      const student = cs.students;
      const studentProgress = thisWeekProgress?.filter(p => p.student_id === student.id) || [];
      const lastStudentProgress = lastWeekProgress?.filter(p => p.student_id === student.id) || [];
      
      const currentAvg = studentProgress.length > 0
        ? studentProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / studentProgress.length
        : 0;
      const lastAvg = lastStudentProgress.length > 0
        ? lastStudentProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / lastStudentProgress.length
        : 0;

      const improvement = currentAvg - lastAvg;
      if (improvement > 15) {
        improvers.push({
          name: `${student.first_name} ${student.last_name}`,
          improvement: improvement.toFixed(0),
        });
      }
    }

    // Sort and take top 5
    improvers.sort((a, b) => parseFloat(b.improvement) - parseFloat(a.improvement));
    const topImprovers = improvers.slice(0, 5);

    // Prepare prompt for AI based on variant
    const systemPrompt = variant === 'teacher'
      ? `You are an AI assistant helping teachers understand their class performance. 
Be clear, actionable, and data-informed. Focus on insights that help teachers make decisions.`
      : variant === 'student'
      ? `You are an encouraging AI tutor writing to a whole class of students. 
Be warm, supportive, and celebrate progress. Never mention grades or compare students.`
      : `You are writing to parents about their children's class progress.
Be informative but gentle, focus on positives, and suggest how parents can support learning at home.`;

    const userPrompt = variant === 'teacher'
      ? `Generate a weekly digest for class "${classData.name}" (${classData.subject}).

KPIs:
- Students: ${totalStudents}
- Avg progress: ${avgProgressThisWeek.toFixed(0)}% (was ${avgProgressLastWeek.toFixed(0)}%)
- Median score: ${medianScore ? medianScore.toFixed(0) : 'N/A'}
- On-time rate: ${onTimeRate}%
- Late: ${lateSubmissions}, Missing: ${missingSubmissions}
- Reflection rate: ${reflectionRate}%
- Active goals: ${activeGoals.length}, Completed: ${completedGoals.length} (${goalCompletionRate}%)

At-risk students: ${atRiskStudents.length > 0 ? atRiskStudents.map(s => `${s.name} (${s.reasons.join(', ')})`).join('; ') : 'None'}

Top improvers: ${topImprovers.length > 0 ? topImprovers.map(i => `${i.name} (+${i.improvement}%)`).join('; ') : 'None yet'}

Generate 4 sections as JSON:

{
  "learning_trend": "2-3 sentences about class-wide learning patterns",
  "goals_status": "1-2 sentences about goal progress",
  "engagement_note": "1-2 sentences about participation patterns",
  "action_steps": ["Step 1", "Step 2", "Step 3"] (3-5 concrete, actionable recommendations)
}`
      : variant === 'student'
      ? `Write an encouraging class update for students in "${classData.name}".

This week:
- ${totalStudents} students working together
- Average progress: ${avgProgressThisWeek.toFixed(0)}%
- ${completedGoals.length} goals completed!
- ${reflections?.length || 0} thoughtful reflections shared

Generate 3 sections as JSON (student-appropriate):

{
  "celebration": "2-3 sentences celebrating class achievements",
  "next_focus": "1-2 sentences about what we're learning next",
  "encouragement": "1-2 sentences of motivation"
}`
      : `Write a parent update for students in "${classData.name}" class.

This week's snapshot:
- Class size: ${totalStudents} students
- On-time submissions: ${onTimeRate}%
- Students completing goals: ${goalCompletionRate}%
- Class engagement: ${reflectionRate}% reflection rate

Generate 3 sections as JSON (parent-appropriate):

{
  "class_summary": "2-3 sentences about overall class progress",
  "support_tips": "2-3 sentences with ways parents can support at home",
  "upcoming_focus": "1-2 sentences about what's coming next week"
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
      throw new Error('Failed to generate digest');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON response
    let aiContent;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      aiContent = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Build payload based on variant
    const payload = {
      kpis: {
        totalStudents,
        avgProgress: parseFloat(avgProgressThisWeek.toFixed(1)),
        avgProgressChange: parseFloat((avgProgressThisWeek - avgProgressLastWeek).toFixed(1)),
        medianScore,
        onTimeRate: parseFloat(onTimeRate),
        lateCount: lateSubmissions,
        missingCount: missingSubmissions,
        reflectionRate: parseFloat(reflectionRate),
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        goalCompletionRate: parseFloat(goalCompletionRate),
      },
      atRiskStudents: variant === 'teacher' ? atRiskStudents : undefined,
      topImprovers: variant !== 'parent' ? topImprovers : undefined,
      aiInsights: aiContent,
      generatedAt: new Date().toISOString(),
    };

    // Store digest
    const { data: digest, error: insertError } = await supabase
      .from('class_weekly_digests')
      .insert({
        class_id: classId,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        payload_json: payload,
        variant,
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
    console.error('Error in ai-class-digest:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
