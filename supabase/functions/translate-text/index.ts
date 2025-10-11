
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client to verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, targetLanguage, sourceLanguage = 'auto' } = await req.json();

    console.log('Translation request received:', { 
      userId: user.id,
      targetLanguage, 
      sourceLanguage, 
      textLength: text?.length 
    });

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Text and target language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Translation service is not properly configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling OpenAI API for translation...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator who specializes in making educational content accessible and easy to understand. 

Translate the given text to ${targetLanguage} using:
- Simple, everyday language that regular people use
- Common words instead of formal or academic terms
- Natural conversational tone
- Clear, easy-to-understand explanations
- Cultural context appropriate for the target language
- Maintain the tone and educational context

Avoid:
- Complex vocabulary or technical jargon
- Overly formal language
- Direct literal translations that sound awkward
- Academic or bureaucratic language

The goal is to make the content feel natural and accessible to everyday speakers of ${targetLanguage}. Only return the translated text, nothing else. Maintain the original formatting and structure.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_completion_tokens: 3000,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ 
          error: data.error?.message || 'Translation service unavailable' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const translatedText = data.choices[0].message.content;
    console.log('Translation completed successfully');

    // Optional: Log translation for analytics
    try {
      await supabaseClient.from('translation_logs').insert({
        user_id: user.id,
        target_language: targetLanguage,
        text_length: text.length,
      });
    } catch (logError) {
      console.error('Failed to log translation:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({
        translatedText,
        sourceLanguage,
        targetLanguage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
