import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

// Voice mapping for different styles
// Using ElevenLabs top voices
const VOICE_MAP: Record<string, string> = {
  'female': 'EXAVITQu4vr4xnSDxMaL', // Sarah
  'male': 'TX3LPaxmHKxFdv7VOQHJ', // Liam
  'neutral': '9BWtsMINqrJLrRacOk9x', // Aria
  'default': '9BWtsMINqrJLrRacOk9x' // Aria
};

// Model selection - using turbo v2.5 for multilingual support with low latency
const ELEVENLABS_MODEL = 'eleven_turbo_v2_5';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request (optional)
    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    // Try to get user if authenticated, but don't require it
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user: authenticatedUser } } = await supabaseClient.auth.getUser();
      user = authenticatedUser;
    }

    const { text, language_code = 'en', voice_style = 'neutral' } = await req.json();

    console.log('TTS request received:', { 
      userId: user?.id || 'anonymous',
      language_code, 
      voice_style, 
      textLength: text?.length 
    });

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!elevenlabsApiKey) {
      console.error('ElevenLabs API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'TTS service is not properly configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first (only if authenticated)
    if (user && authHeader) {
      console.log('Checking TTS cache...');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { data: cachedAudio, error: cacheError } = await supabaseClient
        .from('tts_cache')
        .select('audio_base64, audio_mime')
        .eq('user_id', user.id)
        .eq('text', text)
        .eq('language_code', language_code)
        .eq('voice_style', voice_style)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cachedAudio && !cacheError) {
        console.log('TTS cache hit');
        // Update last_accessed timestamp
        await supabaseClient
          .from('tts_cache')
          .update({ last_accessed: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('text', text)
          .eq('language_code', language_code)
          .eq('voice_style', voice_style);

        return new Response(
          JSON.stringify({
            audio_base64: cachedAudio.audio_base64,
            audio_mime: cachedAudio.audio_mime,
            cached: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Cache miss or anonymous user, generating TTS...');

    // Generate TTS using ElevenLabs
    const voiceId = VOICE_MAP[voice_style] || VOICE_MAP['default'];
    
    console.log('Calling ElevenLabs TTS API...', { voiceId, model: ELEVENLABS_MODEL });
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    console.log('ElevenLabs TTS API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'TTS generation failed' 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert Uint8Array to base64 in Deno
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binary);

    console.log('TTS generation completed successfully');

    // Log AI usage to ai_usage_logs
    try {
      const characterCount = text.length;
      // ElevenLabs TTS pricing: varies by model, estimated ~$0.018 per 1K characters
      const estimatedCost = (characterCount / 1000) * 0.018;

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      await supabaseClient.from('ai_usage_logs').insert({
        user_id: user?.id || null,
        action_type: 'tts',
        model: `elevenlabs/${ELEVENLABS_MODEL}`,
        tokens_used: characterCount, // Store character count as "tokens" for TTS
        estimated_cost: estimatedCost,
        metadata: {
          character_count: characterCount,
          voice_style: voice_style,
          language: language_code,
          voice_id: VOICE_MAP[voice_style] || VOICE_MAP['default'],
          audio_format: 'mp3'
        }
      });
      console.log('AI usage logged successfully');
    } catch (logError) {
      console.error('Failed to log AI usage:', logError);
      // Don't fail the request if logging fails
    }

    // Cache the result (only if authenticated)
    if (user && authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        
        await supabaseClient.from('tts_cache').insert({
          user_id: user.id,
          text,
          language_code,
          voice_style,
          audio_base64: base64Audio,
          audio_mime: 'audio/mp3',
        });
        console.log('TTS cached successfully');
      } catch (cacheInsertError) {
        console.error('Failed to cache TTS:', cacheInsertError);
        // Don't fail the request if caching fails
      }
    }

    return new Response(
      JSON.stringify({
        audio_base64: base64Audio,
        audio_mime: 'audio/mp3',
        cached: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TTS function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
