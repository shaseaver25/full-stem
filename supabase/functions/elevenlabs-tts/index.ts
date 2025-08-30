import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

// Configuration
const MAX_CHARS = 10000; // adjustable
const CACHE_TTL_SECONDS = 3600; // 1 hour cache

// Standardized error response helper
const bad = (status: number, code: string, message: string, corsHeaders?: Record<string, string>) =>
  new Response(JSON.stringify({ code, message }), { 
    status, 
    headers: { 'Content-Type': 'application/json', ...corsHeaders } 
  });

// Environment-driven CORS helper
const getAllowedOrigins = () => {
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  return envOrigins ? envOrigins.split(',').map(o => o.trim()) : null;
};

const getCorsHeaders = (requestOrigin?: string) => {
  const allowedOrigins = getAllowedOrigins();
  
  let allowOrigin = '*'; // Default fallback
  if (allowedOrigins && requestOrigin) {
    if (allowedOrigins.includes(requestOrigin)) {
      allowOrigin = requestOrigin;
    } else {
      // Don't include Access-Control-Allow-Origin if origin not allowed
      return {
        'Vary': 'Origin',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      };
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

// Create SHA-256 hash for cache key
async function createCacheKey(text: string, voiceId: string, rate: number, language?: string): Promise<string> {
  const payload = JSON.stringify({ text, voiceId, rate, language });
  const msgUint8 = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle CORS preflight requests  
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return bad(405, 'METHOD_NOT_ALLOWED', 'Only POST method allowed', corsHeaders);
  }

  try {
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return bad(400, 'INVALID_JSON', 'Invalid JSON in request body', corsHeaders);
    }

    const { text, voiceId, language, rate = 1.0 } = requestData;

    // Input validation
    if (!text) {
      return bad(400, 'MISSING_TEXT', 'Missing text', corsHeaders);
    }

    if (typeof text !== 'string') {
      return bad(400, 'INVALID_TEXT', 'Text must be a string', corsHeaders);
    }

    if (text.length > MAX_CHARS) {
      return bad(413, 'TEXT_TOO_LONG', 'Max 10000 characters', corsHeaders);
    }

    // Check API key availability  
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return bad(500, 'MISSING_SECRET', 'Missing ELEVENLABS_API_KEY', corsHeaders);
    }

    // Use default voice if not provided
    const selectedVoiceId = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah voice

    // Check Supabase Storage cache if enabled
    let cachedResult = null;
    const enableCache = Deno.env.get('ENABLE_TTS_CACHE') === 'true';
    
    if (enableCache) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const cacheKey = await createCacheKey(text, selectedVoiceId, rate, language);
          
          // Try to read from cache
          const { data, error } = await supabase.storage
            .from('tts-cache')
            .download(`${cacheKey}.mp3`);
            
          if (data && !error) {
            const arrayBuffer = await data.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
              binaryString += String.fromCharCode(uint8Array[i]);
            }
            const audioBase64 = btoa(binaryString);
            
            // Generate tokens for cached result
            const tokens = text.split(/(\s+)/).filter(t => t.trim().length > 0);
            const weights = tokens.map(tok => {
              const w = tok.replace(/[^\p{L}\p{N}]/gu, '').length;
              return w || 1;
            });
            
            return new Response(JSON.stringify({
              audioBase64,
              tokens,
              weights,
              cache: true
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (cacheError) {
        console.log('Cache read failed, proceeding without cache:', cacheError);
      }
    }

    // Call ElevenLabs API
    console.log(`Generating speech for text: ${text.substring(0, 100)}...`);

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
        ...(language && { language: language }),
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
        generation_config: { speed: rate },
      }),
    });

    // Handle vendor errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return bad(response.status, 'VENDOR_ERROR', errorText, corsHeaders);
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const audioBase64 = btoa(binaryString);

    // Generate tokens and weights
    const tokens = text.split(/(\s+)/).filter(t => t.trim().length > 0);
    const weights = tokens.map(tok => {
      const w = tok.replace(/[^\p{L}\p{N}]/gu, '').length;
      return w || 1;
    });

    // Store in cache if enabled
    if (enableCache) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const cacheKey = await createCacheKey(text, selectedVoiceId, rate, language);
          
          // Convert base64 back to binary for storage
          const binaryStr = atob(audioBase64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          
          await supabase.storage
            .from('tts-cache')
            .upload(`${cacheKey}.mp3`, bytes, {
              contentType: 'audio/mpeg',
              cacheControl: String(CACHE_TTL_SECONDS),
            });
        }
      } catch (cacheError) {
        console.log('Cache write failed, continuing without cache:', cacheError);
      }
    }

    console.log('Successfully generated speech audio');

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
    return bad(500, 'INTERNAL_ERROR', message, corsHeaders);
  }
});