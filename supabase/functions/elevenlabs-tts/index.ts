import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

// Configuration
const MAX_TEXT_LENGTH = 10000; // ~10KB text limit
const CACHE_TTL_SECONDS = 3600; // 1 hour cache

// Environment-driven CORS (defaults to permissive for backward compatibility)
const getAllowedOrigins = () => {
  const envOrigins = Deno.env.get('CORS_ALLOWED_ORIGINS');
  return envOrigins ? envOrigins.split(',') : ['*'];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': getAllowedOrigins()[0], // Use first origin or '*'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Standardized error response interface
interface ErrorResponse {
  code: string;
  message: string;
}

// Create error response helper
const createError = (code: string, message: string, status = 400): Response => {
  const errorBody: ErrorResponse = { code, message };
  return new Response(JSON.stringify(errorBody), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

// Simple in-memory cache (could be enhanced with Redis/external cache)
const audioCache = new Map<string, { audio: string; tokens: string[]; weights: number[]; timestamp: number }>();

// Create cache key from request parameters
const createCacheKey = (text: string, voiceId: string, language?: string, rate = 1.0): string => {
  return btoa(JSON.stringify({ text, voiceId, language, rate }));
};

// Check if cache entry is valid
const isCacheValid = (timestamp: number): boolean => {
  return (Date.now() - timestamp) < (CACHE_TTL_SECONDS * 1000);
};

// Validate request size
const validateRequestSize = (text: string): void => {
  if (text.length > MAX_TEXT_LENGTH) {
    throw { code: 'PAYLOAD_TOO_LARGE', message: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`, status: 413 };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createError('METHOD_NOT_ALLOWED', 'Only POST method is allowed', 405);
  }

  try {
    // Parse request body with size validation
    const rawBody = await req.text();
    if (rawBody.length > 50000) { // ~50KB total request limit
      return createError('PAYLOAD_TOO_LARGE', 'Request body too large', 413);
    }

    let requestData;
    try {
      requestData = JSON.parse(rawBody);
    } catch (parseError) {
      return createError('INVALID_JSON', 'Invalid JSON in request body');
    }

    const { text, voice, language, voiceId, rate = 1.0 } = requestData;

    // Validate required fields
    if (!text) {
      return createError('MISSING_FIELD', 'Text field is required');
    }

    if (typeof text !== 'string') {
      return createError('INVALID_TYPE', 'Text must be a string');
    }

    // Validate text size
    try {
      validateRequestSize(text);
    } catch (error: any) {
      return createError(error.code, error.message, error.status);
    }

    // Validate rate parameter
    if (typeof rate !== 'number' || rate < 0.25 || rate > 4.0) {
      return createError('INVALID_RATE', 'Rate must be a number between 0.25 and 4.0');
    }

    // Check API key availability
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return createError('SERVER_ERROR', 'ElevenLabs API key not configured', 500);
    }

    // Use a natural voice - Sarah is great for educational content
    const selectedVoiceId = voiceId || voice || 'EXAVITQu4vr4xnSDxMaL'; // Sarah voice ID

    // Check cache first
    const cacheKey = createCacheKey(text, selectedVoiceId, language, rate);
    const cachedResult = audioCache.get(cacheKey);
    
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      console.log('Returning cached audio result');
      return new Response(
        JSON.stringify({
          audioContent: cachedResult.audio,
          tokens: cachedResult.tokens,
          weights: cachedResult.weights,
          cached: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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
        model_id: 'eleven_turbo_v2_5', // Fast, high-quality model with multilingual support
        ...(language && { language: language }), // Add language if specified
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
        generation_config: { speed: rate },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      // Handle specific ElevenLabs API errors
      if (response.status === 401) {
        return createError('UNAUTHORIZED', 'Invalid ElevenLabs API key', 500);
      } else if (response.status === 429) {
        return createError('RATE_LIMITED', 'ElevenLabs API rate limit exceeded', 429);
      } else if (response.status === 422) {
        return createError('INVALID_VOICE', 'Invalid voice ID or parameters');
      } else {
        return createError('EXTERNAL_API_ERROR', `ElevenLabs API error: ${response.status}`, 502);
      }
    }

    // Convert audio to base64 using proper method
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Validate audio size (prevent memory issues)
    const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB limit
    if (arrayBuffer.byteLength > MAX_AUDIO_SIZE) {
      return createError('AUDIO_TOO_LARGE', 'Generated audio exceeds size limit', 413);
    }
    
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binaryString);

    console.log('Successfully generated speech audio');

    // Provide tokenizer outputs so client can synthesize timings exactly to its measured duration.
    const tokens = text.split(/(\s+)/).filter(t => t.trim().length > 0);
    const weights = tokens.map(tok => {
      const w = tok.replace(/[^\p{L}\p{N}]/gu, '').length;
      return w || 1;
    });

    // Cache the result
    audioCache.set(cacheKey, {
      audio: base64Audio,
      tokens,
      weights,
      timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    if (audioCache.size > 100) { // Simple cleanup when cache gets large
      const cutoff = Date.now() - (CACHE_TTL_SECONDS * 1000);
      for (const [key, entry] of audioCache.entries()) {
        if (entry.timestamp < cutoff) {
          audioCache.delete(key);
        }
      }
    }

    return new Response(
      JSON.stringify({
        audioContent: base64Audio,
        tokens,
        weights,
        cached: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    
    // Handle different error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return createError('NETWORK_ERROR', 'Failed to connect to ElevenLabs API', 502);
    }
    
    if (error.name === 'SyntaxError') {
      return createError('INVALID_RESPONSE', 'Invalid response from ElevenLabs API', 502);
    }
    
    // Default error response
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return createError('INTERNAL_ERROR', message, 500);
  }
});