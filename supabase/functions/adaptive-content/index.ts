import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, classId } = await req.json();

    if (!lessonId || !classId) {
      throw new Error("lessonId and classId are required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get current user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get teacher profile
    const { data: teacherProfile, error: teacherError } = await supabase
      .from("teacher_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (teacherError || !teacherProfile) {
      throw new Error("Teacher profile not found");
    }

    // Fetch the original lesson
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons_generated")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      throw new Error("Lesson not found");
    }

    // Fetch class students with their profiles
    const { data: classStudents, error: studentsError } = await supabase
      .from("class_students")
      .select(`
        student_id,
        students:student_id (
          first_name,
          last_name,
          grade_level,
          reading_level,
          language_preference,
          iep_accommodations,
          learning_style,
          interests
        )
      `)
      .eq("class_id", classId)
      .eq("status", "active");

    if (studentsError) {
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    // Summarize student data for AI prompt
    const studentSummary = {
      totalStudents: classStudents?.length || 0,
      readingLevels: {} as Record<string, number>,
      languages: {} as Record<string, number>,
      iepCount: 0,
      learningStyles: {} as Record<string, number>,
      commonInterests: [] as string[],
    };

    const allInterests: string[] = [];

    classStudents?.forEach((cs: any) => {
      const student = cs.students;
      if (!student) return;

      // Count reading levels
      if (student.reading_level) {
        studentSummary.readingLevels[student.reading_level] = 
          (studentSummary.readingLevels[student.reading_level] || 0) + 1;
      }

      // Count languages
      if (student.language_preference) {
        studentSummary.languages[student.language_preference] = 
          (studentSummary.languages[student.language_preference] || 0) + 1;
      }

      // Count IEP students
      if (student.iep_accommodations && student.iep_accommodations.length > 0) {
        studentSummary.iepCount++;
      }

      // Count learning styles
      if (student.learning_style) {
        studentSummary.learningStyles[student.learning_style] = 
          (studentSummary.learningStyles[student.learning_style] || 0) + 1;
      }

      // Collect interests
      if (student.interests && Array.isArray(student.interests)) {
        allInterests.push(...student.interests);
      }
    });

    // Find common interests
    const interestCounts: Record<string, number> = {};
    allInterests.forEach(interest => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });
    studentSummary.commonInterests = Object.entries(interestCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([interest]) => interest);

    console.log("Student Summary:", JSON.stringify(studentSummary, null, 2));

    // Call OpenAI to refine the lesson
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const systemPrompt = `You are an expert curriculum designer specializing in adaptive learning.
Your task is to refine lesson plans to match the specific needs of a class.

Analyze the student demographics and adapt the lesson to:
1. Adjust reading level and vocabulary complexity
2. Add scaffolding for struggling learners
3. Include extension activities for advanced students
4. Incorporate multilingual supports if needed
5. Add specific IEP accommodations
6. Connect content to student interests
7. Vary instructional approaches for different learning styles

Return the adapted lesson in the same JSON structure as the original, with modifications throughout all sections.`;

    const userPrompt = `Adapt this lesson for a class with the following demographics:

Student Summary:
- Total Students: ${studentSummary.totalStudents}
- Reading Levels: ${JSON.stringify(studentSummary.readingLevels)}
- Language Preferences: ${JSON.stringify(studentSummary.languages)}
- Students with IEPs: ${studentSummary.iepCount}
- Learning Styles: ${JSON.stringify(studentSummary.learningStyles)}
- Common Interests: ${studentSummary.commonInterests.join(", ")}

Original Lesson:
${JSON.stringify(lesson.lesson_json, null, 2)}

Please refine this lesson to better serve this specific class. Make concrete, specific adaptations throughout all sections (objectives, materials, warmup, instruction, practice, differentiation, assessment).`;

    const startTime = Date.now();
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const refinedLessonText = aiResponse.choices[0].message.content;
    
    // Parse the refined lesson JSON
    let refinedLesson;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = refinedLessonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        refinedLesson = JSON.parse(jsonMatch[1]);
      } else {
        refinedLesson = JSON.parse(refinedLessonText);
      }
    } catch (parseError) {
      console.error("Failed to parse refined lesson:", parseError);
      console.log("Raw response:", refinedLessonText);
      throw new Error("Failed to parse refined lesson from AI response");
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Calculate usage and cost
    const inputTokens = aiResponse.usage?.prompt_tokens || 0;
    const outputTokens = aiResponse.usage?.completion_tokens || 0;
    const estimatedCost = (inputTokens * 0.005 + outputTokens * 0.015) / 1000; // GPT-4o pricing

    // Save the refinement
    const { data: refinement, error: saveError } = await supabase
      .from("lesson_refinements")
      .insert({
        lesson_id: lessonId,
        teacher_id: teacherProfile.id,
        class_id: classId,
        refined_json: refinedLesson,
        student_summary: studentSummary,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving refinement:", saveError);
      throw new Error("Failed to save refinement");
    }

    // Log to AI history (without teacher_id since table doesn't have it)
    await supabase.from("ai_lesson_history").insert({
      operation_type: "adaptive_refinement",
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost: estimatedCost,
      provider: "openai",
      model: "gpt-4o",
      metadata: {
        lesson_id: lessonId,
        class_id: classId,
        refinement_id: refinement.id,
        student_count: studentSummary.totalStudents,
        processing_time_ms: processingTime,
        teacher_id: teacherProfile.id,
      },
    });

    console.log(`Refinement completed in ${processingTime}ms`);
    console.log(`Tokens: ${inputTokens} in, ${outputTokens} out`);
    console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);

    return new Response(
      JSON.stringify({
        refinement,
        usage: {
          inputTokens,
          outputTokens,
          estimatedCost,
          provider: "openai",
          model: "gpt-4o",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in adaptive-content function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
