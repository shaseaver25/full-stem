import { serve as startServer } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
};

// Map template component names to database types
const componentTypeMap: Record<string, string> = {
  "instructions": "instructions",
  "page": "page",
  "multimedia": "video",
  "video": "video",
  "coding ide": "codingEditor",
  "codingide": "codingEditor",
  "activity": "activity",
  "quiz": "quiz",
  "assessment": "quiz",
  "discussion": "discussion",
  "reflection": "reflection",
  "assignment": "assignment",
  "resources": "resources",
  "poll": "poll",
  "survey": "poll",
  "flashcards": "flashcards",
  "slides": "slides",
};

startServer(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    console.log("📋 Processing lesson template");
    
    const body = await req.json();
    const text = body.parsedContent || '';
    const lessonId = body.lessonId;
    
    console.log("✅ Received text length:", text.length);
    console.log("📄 First 500 chars:", text.substring(0, 500));
    
    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "No content provided" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Parse metadata section - more flexible patterns
    const metadataMatch = text.match(/(?:#\s*)?Lesson Metadata[\s\S]*?(?:---|$)/i);
    const metadataText = metadataMatch ? metadataMatch[0] : text.substring(0, 1000);
    
    const metadata = {
      title: metadataText.match(/Title:\s*(.+)/i)?.[1]?.trim() || "Untitled Lesson",
      subject: metadataText.match(/Subject:\s*(.+)/i)?.[1]?.trim() || null,
      grade_level: metadataText.match(/Grade Level:\s*(.+)/i)?.[1]?.trim() || null,
      duration: parseInt(metadataText.match(/Duration[^\d]*(\d+)/i)?.[1] || "60"),
      reading_level: parseInt(metadataText.match(/Reading Level:\s*(\d+)/i)?.[1] || "5"),
      language: metadataText.match(/Language:\s*(.+)/i)?.[1]?.trim() || "en-US",
      description: metadataText.match(/Description:\s*(.+)/i)?.[1]?.trim() || null,
    };

    console.log("📝 Parsed metadata:", metadata);

    // Parse component sections - split on both --- and ## Component:
    let componentSections: string[] = [];
    
    // Try splitting by --- first
    if (text.includes('---')) {
      componentSections = text.split(/---+/).slice(1);
    } else {
      // If no ---, try splitting by ## Component:
      const componentMatches = text.matchAll(/##\s*Component:\s*(.+?)(?=##\s*Component:|$)/gis);
      componentSections = Array.from(componentMatches).map(m => '## Component: ' + m[0]);
    }
    
    console.log(`📦 Found ${componentSections.length} potential component sections`);
    
    const parsedComponents: any[] = [];

    for (const section of componentSections) {
      // More flexible matching - handle both "## Component:" and just "Component:"
      const componentMatch = section.match(/(?:##\s*)?Component:\s*(.+?)[\r\n]+([\s\S]*)/i);
      if (!componentMatch) {
        console.log("⚠️ Skipping section (no match):", section.substring(0, 100));
        continue;
      }

      const rawType = componentMatch[1].trim().toLowerCase();
      const content = componentMatch[2].trim();
      
      console.log(`📋 Processing component: ${rawType} (${content.length} chars)`);
      
      if (!content) {
        console.log("⚠️ Skipping empty content for:", rawType);
        continue;
      }

      const componentType = componentTypeMap[rawType];
      if (!componentType) {
        console.warn(`⚠️ Unknown component type: ${rawType}, skipping`);
        continue;
      }

      let parsedContent: any = {};
      let title = `${rawType.charAt(0).toUpperCase() + rawType.slice(1)}`;

      // Parse based on component type
      if (componentType === 'page') {
        // Extract title from first line or heading
        const titleMatch = content.match(/^#\s*(.+)/m) || content.match(/^(.+)/);
        title = titleMatch ? titleMatch[1].trim() : title;
        parsedContent = {
          title,
          body: content.replace(/^#\s*.+[\r\n]+/, ''), // Remove title if present
        };
      } else if (componentType === 'quiz') {
        // Parse Q: and A: format
        const questions: any[] = [];
        const qaPairs = content.split(/\n(?=Q:)/);
        
        for (const pair of qaPairs) {
          const questionMatch = pair.match(/Q:\s*(.+)/);
          const answerMatch = pair.match(/A:\s*(.+)/);
          
          if (questionMatch && answerMatch) {
            questions.push({
              question: questionMatch[1].trim(),
              type: "short_answer",
              correct_answer: answerMatch[1].trim(),
            });
          }
        }
        
        parsedContent = {
          quizData: {
            title: "Quiz",
            questions,
          }
        };
      } else if (componentType === 'video') {
        // Extract video URLs
        const urls = content.match(/https?:\/\/[^\s]+/g) || [];
        parsedContent = {
          title,
          url: urls[0] || '',
          caption: content.replace(/https?:\/\/[^\s]+/g, '').trim(),
        };
      } else if (componentType === 'discussion') {
        parsedContent = {
          prompt: content,
        };
      } else if (componentType === 'activity' || componentType === 'assignment') {
        // Parse numbered steps if present
        const steps = content.match(/^\d+\.\s*(.+)/gm);
        parsedContent = {
          instructions: content,
          steps: steps?.map(s => s.replace(/^\d+\.\s*/, '')) || [],
        };
      } else {
        // Default: store as plain content
        parsedContent = {
          text: content,
        };
      }

      parsedComponents.push({
        component_type: componentType,
        title,
        content: parsedContent,
        is_assignable: componentType === 'assignment',
      });
    }

    console.log(`✅ Parsed ${parsedComponents.length} components`);

    if (!lessonId) {
      return new Response(JSON.stringify({ 
        error: "Lesson ID is required for template upload" 
      }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update lesson metadata
    const { error: lessonError } = await supabase
      .from('lessons')
      .update({
        title: metadata.title,
        description: metadata.description,
        duration: metadata.duration,
      })
      .eq('id', lessonId);

    if (lessonError) {
      console.error("❌ Error updating lesson:", lessonError);
      throw lessonError;
    }

    // Insert components
    if (parsedComponents.length > 0) {
      const componentsToInsert = parsedComponents.map((comp, index) => ({
        lesson_id: lessonId,
        component_type: comp.component_type,
        content: comp.content,
        order: index,
        enabled: true,
        is_assignable: comp.is_assignable || false,
        language_code: metadata.language.split('-')[0] || 'en',
        reading_level: metadata.reading_level,
        read_aloud: true,
      }));

      const { error: insertError } = await supabase
        .from('lesson_components')
        .insert(componentsToInsert);

      if (insertError) {
        console.error("❌ Error inserting components:", insertError);
        throw insertError;
      }

      console.log(`✅ Inserted ${componentsToInsert.length} components into database`);
    }

    const responseBody = {
      success: true,
      metadata,
      componentsCreated: parsedComponents.length,
      components: parsedComponents.map((c, i) => ({
        type: c.component_type,
        title: c.title,
        order: i,
      })),
      lessonId,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("❌ Server error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal Server Error",
      details: error.toString(),
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
