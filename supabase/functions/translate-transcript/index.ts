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
    const { transcriptId, targetLanguage } = await req.json();
    
    if (!transcriptId || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Transcript ID and target language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key not configured');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get transcript
    const { data: transcript, error: transcriptError } = await supabaseClient
      .from('video_transcripts')
      .select('*')
      .eq('id', transcriptId)
      .single();

    if (transcriptError || !transcript) {
      throw new Error('Transcript not found');
    }

    console.log('Translating transcript to', targetLanguage);

    // Check if translation already exists
    const { data: existingTranslation } = await supabaseClient
      .from('video_translations')
      .select('*')
      .eq('transcript_id', transcriptId)
      .eq('language', targetLanguage)
      .single();

    if (existingTranslation) {
      console.log('Translation already exists');
      return new Response(
        JSON.stringify({ 
          success: true,
          translationId: existingTranslation.id,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Translate full text
    const fullTextResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Translate the following text to ${targetLanguage}. Maintain the natural flow and conversational tone. Only return the translated text, nothing else.`
          },
          {
            role: 'user',
            content: transcript.content
          }
        ],
        max_tokens: 4000,
      }),
    });

    if (!fullTextResponse.ok) {
      throw new Error('Failed to translate text');
    }

    const fullTextData = await fullTextResponse.json();
    const translatedText = fullTextData.choices[0].message.content;

    console.log('Full text translated');

    // Translate segments individually for synchronized captions
    const segments = transcript.segments || [];
    const translatedSegments = [];

    for (const segment of segments) {
      const segmentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `Translate this short caption to ${targetLanguage}. Keep it concise and natural. Only return the translated text.`
            },
            {
              role: 'user',
              content: segment.text
            }
          ],
          max_tokens: 200,
        }),
      });

      if (segmentResponse.ok) {
        const segmentData = await segmentResponse.json();
        translatedSegments.push({
          start: segment.start,
          end: segment.end,
          text: segmentData.choices[0].message.content,
        });
      } else {
        // Fallback: use original text if translation fails
        translatedSegments.push(segment);
      }
    }

    console.log('Segments translated:', translatedSegments.length);

    // Save translation to database
    const { data: translation, error: saveError } = await supabaseClient
      .from('video_translations')
      .insert({
        transcript_id: transcriptId,
        language: targetLanguage,
        content: translatedText,
        segments: translatedSegments,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save translation:', saveError);
      throw saveError;
    }

    console.log('Translation saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        translationId: translation.id,
        segmentCount: translatedSegments.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in translate-transcript:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
