import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Voice mapping for different styles and languages
const VOICE_MAP: Record<string, string> = {
  'female': 'nova',
  'male': 'onyx',
  'neutral': 'alloy',
  'default': 'alloy'
};

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

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
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

    // Generate TTS using OpenAI
    const voice = VOICE_MAP[voice_style] || VOICE_MAP['default'];
    
    console.log('Calling OpenAI TTS API...');
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: text,
        response_format: 'mp3',
      }),
    });

    console.log('OpenAI TTS API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'TTS generation failed' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
