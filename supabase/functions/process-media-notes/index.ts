import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

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

    // Detect media type and prepare for transcript processing
    let mediaType = 'unknown';
    let placeholderTranscript = 'Transcript processing is not implemented yet.';
    
    if (media_url.includes('youtube.com') || media_url.includes('youtu.be')) {
      mediaType = 'youtube';
      console.log('Detected YouTube video');
    } else if (media_url.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      mediaType = 'audio';
      console.log('Detected audio file');
    } else if (media_url.match(/\.(mp4|webm|mov)$/i)) {
      mediaType = 'video';
      console.log('Detected video file');
    }
    
    console.log(`Media type: ${mediaType}`);
    console.log(`Placeholder transcript: ${placeholderTranscript}`);
    
    // Update the note with placeholder transcript
    const { error: updateError } = await supabase
      .from('lesson_media_notes')
      .update({
        summary_teacher: placeholderTranscript,
        summary_student: placeholderTranscript
      })
      .eq('id', noteData.id);
    
    if (updateError) {
      console.error('Error updating with placeholder transcript:', updateError);
    }

    // TODO: Add AI processing logic here
    // This will call external AI services to:
    // - Transcribe the media (using Whisper or similar)
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
