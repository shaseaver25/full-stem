import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { componentId } = await req.json();
    
    if (!componentId) {
      return new Response(
        JSON.stringify({ error: 'Component ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get lesson component details
    const { data: component, error: componentError } = await supabaseClient
      .from('lesson_components')
      .select('*')
      .eq('id', componentId)
      .single();

    if (componentError || !component) {
      throw new Error('Lesson component not found');
    }

    if (component.component_type !== 'video') {
      throw new Error('Component is not a video');
    }

    const content = component.content as any;
    const videoFile = content.uploadedFiles?.[0];
    
    if (!videoFile?.path) {
      throw new Error('No video file found in component');
    }

    console.log('Fetching video file from storage:', videoFile.path);

    // Download video file from lesson-files storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('lesson-files')
      .download(videoFile.path);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      throw new Error('Failed to download video file');
    }

    console.log('Video file downloaded, size:', fileData.size);

    // Prepare form data for OpenAI Whisper
    const formData = new FormData();
    formData.append('file', fileData, 'video.mp4');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    console.log('Sending to Lovable AI Whisper API...');

    // Send to Lovable AI Whisper API
    const whisperResponse = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Lovable AI API error:', errorText);
      throw new Error(`Lovable AI API error: ${errorText}`);
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

    // Update lesson component with transcript data
    const updatedContent = {
      ...content,
      transcript: {
        text: fullText,
        segments: segments,
        language: 'en',
        duration: transcriptionData.duration
      }
    };

    const { error: updateError } = await supabaseClient
      .from('lesson_components')
      .update({ content: updatedContent })
      .eq('id', componentId);

    if (updateError) {
      console.error('Failed to update component:', updateError);
      throw updateError;
    }

    console.log('Transcription saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        segmentCount: segments.length,
        duration: transcriptionData.duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-lesson-video:', error);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
