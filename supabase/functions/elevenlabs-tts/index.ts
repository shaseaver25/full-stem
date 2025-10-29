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

    // Call ElevenLabs API with timestamp alignment
    console.log(`Calling ElevenLabs API for text: "${text.substring(0, 50)}..."`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/with-timestamps`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
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
        output_format: 'mp3_44100_128',
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

    // Parse the response containing both audio and alignment data
    const responseData = await response.json();
    console.log('Response data structure:', {
      hasAudio: !!responseData.audio_base64,
      hasAlignment: !!responseData.alignment,
      alignmentType: typeof responseData.alignment
    });

    // Extract audio
    const audioBase64 = responseData.audio_base64;
    
    if (!audioBase64) {
      console.error('No audio data in response');
      return new Response(JSON.stringify({ 
        error: 'No audio data received from ElevenLabs' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract word-level timings from alignment data
    let tokens: string[] = [];
    let weights: number[] = [];

    if (responseData.alignment && responseData.alignment.characters) {
      console.log('Processing character alignment data...');
      
      const characters = responseData.alignment.characters;
      const charStartTimes = responseData.alignment.character_start_times_seconds;
      const charEndTimes = responseData.alignment.character_end_times_seconds;
      
      // Group characters into words
      let currentWord = '';
      let wordStartTime = 0;
      const wordTimings: Array<{word: string, start: number, end: number}> = [];
      
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        
        if (char === ' ' || i === characters.length - 1) {
          // End of word
          if (i === characters.length - 1 && char !== ' ') {
            currentWord += char;
          }
          
          if (currentWord.length > 0) {
            const endTime = charEndTimes[i === characters.length - 1 ? i : i - 1];
            wordTimings.push({
              word: currentWord,
              start: wordStartTime,
              end: endTime
            });
            tokens.push(currentWord);
            weights.push(endTime - wordStartTime);
          }
          
          currentWord = '';
          wordStartTime = charStartTimes[i + 1] || charEndTimes[i];
        } else {
          if (currentWord.length === 0) {
            wordStartTime = charStartTimes[i];
          }
          currentWord += char;
        }
      }
      
      console.log('Extracted word timings:', wordTimings.length, 'words');
      console.log('First 3 words:', wordTimings.slice(0, 3));
    } else {
      // Fallback: generate synthetic timings
      console.warn('No alignment data available, using fallback');
      tokens = text.split(/\s+/).filter(t => t.length > 0);
      weights = tokens.map(tok => tok.length || 1);
    }

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