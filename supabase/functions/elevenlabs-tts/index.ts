import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('ElevenLabs TTS function started - method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing TTS request');

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log('Request data parsed:', { 
        hasText: !!requestData.text, 
        textLength: requestData.text?.length,
        voiceId: requestData.voiceId 
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { text, voiceId, rate = 1.0 } = requestData;

    // Input validation
    if (!text) {
      console.error('Missing text in request');
      return new Response(JSON.stringify({ 
        error: 'Missing text parameter' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (text.length > 10000) {
      console.error('Text too long:', text.length);
      return new Response(JSON.stringify({ 
        error: 'Text too long, max 10000 characters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check API key
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    console.log('API key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('Missing ELEVENLABS_API_KEY');
      return new Response(JSON.stringify({ 
        error: 'ElevenLabs API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use default voice if not provided
    const selectedVoiceId = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah voice
    console.log('Using voice ID:', selectedVoiceId);

    // Call ElevenLabs API
    console.log(`Calling ElevenLabs API for text: "${text.substring(0, 50)}..."`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
        generation_config: { speed: rate },
      }),
    });

    console.log('ElevenLabs API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('ElevenLabs API error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: `ElevenLabs API error: ${errorText}` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert audio to base64
    console.log('Converting audio to base64...');
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const audioBase64 = btoa(binaryString);

    // Generate tokens and weights for highlighting
    const tokens = text.split(/(\s+)/).filter(t => t.trim().length > 0);
    const weights = tokens.map(tok => {
      const w = tok.replace(/[^\p{L}\p{N}]/gu, '').length;
      return w || 1;
    });

    console.log('Successfully generated speech, tokens:', tokens.length);

    return new Response(JSON.stringify({
      audioBase64,
      tokens,
      weights,
      cache: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return new Response(JSON.stringify({ 
      error: message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});