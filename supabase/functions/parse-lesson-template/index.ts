import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import mammoth from 'https://esm.sh/mammoth@1.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📄 Parsing lesson template...');
    
    // Detect content type and parse accordingly
    const contentType = req.headers.get("content-type") || "";
    let contentToParse = "";
    let lessonId: string | undefined;
    
    if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      // Handle .docx upload directly
      console.log('📄 Processing .docx file from direct upload...');
      
      try {
        const arrayBuffer = await req.arrayBuffer();
        const { value } = await mammoth.extractRawText({ buffer: arrayBuffer });
        contentToParse = value;
        
        console.log('✅ .docx converted to text, length:', contentToParse.length);
      } catch (conversionError) {
        console.error('❌ DOCX parsing failed:', conversionError);
        return new Response(
          JSON.stringify({ error: "Failed to extract text from .docx" }), 
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } else {
      // Handle JSON payload (plain text or base64 encoded .docx)
      const requestBody = await req.json();
      const { parsedContent, lessonId: requestLessonId, base64File, fileType } = requestBody;
      lessonId = requestLessonId;
      
      if (base64File && fileType === 'docx') {
        console.log('📄 Processing .docx file from base64...');
        
        try {
          // Decode base64 to ArrayBuffer
          const binaryString = atob(base64File);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Extract text from .docx using Mammoth
          const result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
          contentToParse = result.value;
          
          console.log('✅ .docx converted to text, length:', contentToParse.length);
        } catch (conversionError) {
          console.error('❌ DOCX parsing failed:', conversionError);
          return new Response(
            JSON.stringify({ error: "Failed to extract text from .docx" }), 
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      } else {
        // Plain text content
        contentToParse = parsedContent;
      }
    }
    
    // Validate text content
    if (!contentToParse) {
      throw new Error('No content provided for parsing');
    }

    // Parse the document content
    const lines = contentToParse.split('\n');
    
    // Extract metadata
    const metadata: any = {
      title: '',
      subject: '',
      grade_level: '',
      duration: null,
      reading_level: null,
      language_code: 'en-US',
      description: ''
    };

    let currentSection = '';
    let currentContent = '';
    const components: any[] = [];
    let inMetadata = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect metadata section
      if (line === '# Lesson Metadata') {
        inMetadata = true;
        continue;
      }

      if (line === '---') {
        inMetadata = false;
        // Save previous component if exists
        if (currentSection && currentContent.trim()) {
          components.push({
            section: currentSection,
            content: currentContent.trim()
          });
          currentContent = '';
        }
        continue;
      }

      // Extract metadata
      if (inMetadata && line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        if (value && !value.startsWith('[')) {
          const lowerKey = key.toLowerCase().trim();
          if (lowerKey === 'title') metadata.title = value;
          else if (lowerKey === 'subject') metadata.subject = value;
          else if (lowerKey === 'grade level') metadata.grade_level = value;
          else if (lowerKey.includes('duration')) {
            const match = value.match(/\d+/);
            if (match) metadata.duration = parseInt(match[0]);
          }
          else if (lowerKey.includes('reading')) {
            const match = value.match(/\d+/);
            if (match) metadata.reading_level = parseInt(match[0]);
          }
          else if (lowerKey === 'language') metadata.language_code = value;
          else if (lowerKey === 'description') metadata.description = value;
        }
      }

      // Detect component sections
      if (line.startsWith('## Component:')) {
        // Save previous component
        if (currentSection && currentContent.trim()) {
          components.push({
            section: currentSection,
            content: currentContent.trim()
          });
        }
        // Start new component
        currentSection = line.replace('## Component:', '').trim();
        currentContent = '';
        continue;
      }

      // Accumulate content
      if (currentSection) {
        currentContent += line + '\n';
      }
    }

    // Save last component
    if (currentSection && currentContent.trim()) {
      components.push({
        section: currentSection,
        content: currentContent.trim()
      });
    }

    console.log('✅ Parsed metadata:', metadata);
    console.log('✅ Found components:', components.length);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get teacher profile
    const { data: teacherProfile, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (teacherError || !teacherProfile) {
      throw new Error('Teacher profile not found');
    }

    // Update lesson metadata if lessonId provided, otherwise create new lesson
    let finalLessonId = lessonId;
    
    if (lessonId) {
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          title: metadata.title || 'Imported Lesson',
          description: metadata.description || '',
          duration: metadata.duration || 45,
          grade_level: metadata.grade_level || '',
          subject: metadata.subject || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId);

      if (updateError) {
        console.error('❌ Error updating lesson:', updateError);
        throw updateError;
      }
    } else {
      const { data: newLesson, error: createError } = await supabase
        .from('lessons')
        .insert({
          teacher_id: teacherProfile.id,
          title: metadata.title || 'Imported Lesson',
          description: metadata.description || '',
          duration: metadata.duration || 45,
          grade_level: metadata.grade_level || '',
          subject: metadata.subject || '',
          status: 'draft'
        })
        .select()
        .single();

      if (createError || !newLesson) {
        console.error('❌ Error creating lesson:', createError);
        throw createError;
      }

      finalLessonId = newLesson.id;
    }

    // Map component sections to types
    const componentTypeMap: Record<string, string> = {
      'instructions': 'page',
      'page': 'page',
      'multimedia': 'video',
      'video': 'video',
      'coding ide': 'codingEditor',
      'code': 'codingEditor',
      'activity': 'activity',
      'quiz': 'assessment',
      'assessment': 'assessment',
      'discussion': 'discussion',
      'reflection': 'page',
      'assignment': 'assignment',
      'resources': 'page'
    };

    // Create lesson components
    const createdComponents = [];
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      const componentType = componentTypeMap[comp.section.toLowerCase()] || 'page';
      const isAssignable = comp.section.toLowerCase() === 'assignment';

      const componentData: any = {
        lesson_id: finalLessonId,
        component_type: componentType,
        title: comp.section,
        content: { text: comp.content },
        order: i,
        enabled: true,
        is_assignable: isAssignable,
        reading_level: metadata.reading_level || null,
        language_code: metadata.language_code,
        read_aloud: false
      };

      const { data: newComponent, error: compError } = await supabase
        .from('lesson_components')
        .insert(componentData)
        .select()
        .single();

      if (compError) {
        console.error('❌ Error creating component:', compError);
      } else {
        createdComponents.push(newComponent);
        console.log(`✅ Created ${componentType} component: ${comp.section}`);
      }
    }

    console.log(`✅ Lesson imported successfully with ${createdComponents.length} components`);

    return new Response(
      JSON.stringify({
        success: true,
        lessonId: finalLessonId,
        metadata,
        componentsCreated: createdComponents.length,
        components: createdComponents.map(c => ({
          id: c.id,
          type: c.component_type,
          title: c.title
        }))
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('❌ Error parsing lesson template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
