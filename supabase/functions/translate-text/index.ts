
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { text, targetLanguage, sourceLanguage = 'auto' } = await req.json();

    console.log('Translation request received:', { 
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator who specializes in making content accessible and easy to understand. 

Translate the given text to ${targetLanguage} using:
- Simple, everyday language that regular people use
- Common words instead of formal or academic terms
- Natural conversational tone
- Clear, easy-to-understand explanations
- Cultural context appropriate for the target language

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
        temperature: 0.2,
        max_tokens: 3000,
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
