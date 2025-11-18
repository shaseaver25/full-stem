import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { media_id, media_url, lesson_id } = await req.json();

    console.log('Processing media notes for:', {
      media_id,
      media_url,
      lesson_id
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save placeholder row in lesson_media_notes
    const { data: noteData, error: noteError } = await supabase
      .from('lesson_media_notes')
      .insert({
        media_id,
        summary_teacher: 'Processing…',
        summary_student: 'Processing…',
        themes: [],
        vocab_list: [],
        questions: {},
        translations: {},
        recommended_next: {}
      })
      .select()
      .single();

    if (noteError) {
      console.error('Error inserting placeholder:', noteError);
      throw noteError;
    }

    console.log('Placeholder row created:', noteData);

    // TODO: Add AI processing logic here
    // This will call external AI services to:
    // - Transcribe the media
    // - Generate summaries (teacher and student versions)
    // - Extract themes
    // - Create vocabulary list
    // - Generate comprehension questions
    // - Create translations
    // - Recommend next content

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Media notes processing triggered',
        media_id,
        note_id: noteData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error processing media notes:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
