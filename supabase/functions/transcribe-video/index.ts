import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get video details
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      throw new Error('Video not found');
    }

    // Update status to processing
    await supabaseClient
      .from('videos')
      .update({ transcription_status: 'processing' })
      .eq('id', videoId);

    console.log('Fetching video file from storage:', video.file_url);

    // Download video file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('lesson-videos')
      .download(video.file_url.replace('/storage/v1/object/public/lesson-videos/', ''));

    if (downloadError || !fileData) {
      throw new Error('Failed to download video file');
    }

    console.log('Video file downloaded, size:', fileData.size);

    // Prepare form data for OpenAI Whisper
    const formData = new FormData();
    formData.append('file', fileData, 'video.mp4');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    console.log('Sending to OpenAI Whisper API...');

    // Send to OpenAI Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const transcriptionData = await whisperResponse.json();
    console.log('Transcription completed, segments:', transcriptionData.segments?.length);

    // Extract full text
    const fullText = transcriptionData.text || '';

    // Format segments for storage
    const segments = transcriptionData.segments?.map((seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })) || [];

    // Save transcript to database
    const { data: transcript, error: transcriptError } = await supabaseClient
      .from('video_transcripts')
      .insert({
        video_id: videoId,
        language: 'en', // Original language
        content: fullText,
        segments: segments,
      })
      .select()
      .single();

    if (transcriptError) {
      console.error('Failed to save transcript:', transcriptError);
      throw transcriptError;
    }

    // Update video status to completed
    await supabaseClient
      .from('videos')
      .update({ 
        transcription_status: 'completed',
        duration_seconds: transcriptionData.duration 
      })
      .eq('id', videoId);

    console.log('Transcription saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        transcriptId: transcript.id,
        segmentCount: segments.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-video:', error);

    // Try to update video status to failed
    try {
      const { videoId } = await req.json();
      if (videoId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        await supabaseClient
          .from('videos')
          .update({ 
            transcription_status: 'failed',
            transcription_error: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', videoId);
      }
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
