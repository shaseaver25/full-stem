import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

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

    const { text, targetLanguage, sourceLanguage = 'auto' } = await req.json();

    console.log('Translation request received:', { 
      userId: user?.id || 'anonymous',
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

    if (!lovableApiKey) {
      console.error('Lovable API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Translation service is not properly configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate MD5 hash for cache lookup
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Checking translation cache...', { contentHash, targetLanguage, sourceLanguage });

    // Check cache first
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      const { data: cached, error: cacheError } = await supabaseClient
        .from('translation_cache')
        .select('id, translated_content, access_count')
        .eq('content_hash', contentHash)
        .eq('source_language', sourceLanguage)
        .eq('target_language', targetLanguage)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
        .single();

      if (cached && !cacheError) {
        console.log('Cache hit! Returning cached translation', { cacheId: cached.id, accessCount: cached.access_count });

        // Update cache stats (non-blocking)
        supabaseClient
          .from('translation_cache')
          .update({
            last_accessed_at: new Date().toISOString(),
            access_count: (cached.access_count || 0) + 1
          })
          .eq('id', cached.id)
          .then(() => console.log('Cache stats updated'))
          .catch(err => console.error('Failed to update cache stats:', err));

        // Log cache hit with $0 cost
        try {
          await supabaseClient.from('ai_usage_logs').insert({
            user_id: user?.id || null,
            action_type: 'translation',
            model: 'google/gemini-2.5-flash',
            tokens_used: 0,
            estimated_cost: 0.00,
            metadata: {
              from_cache: true,
              cache_hit: true,
              source_language: sourceLanguage,
              target_language: targetLanguage,
              content_length: text.length,
              cache_id: cached.id,
              access_count: cached.access_count + 1
            }
          });
          console.log('Cache hit logged to ai_usage_logs');
        } catch (logError) {
          console.error('Failed to log cache hit:', logError);
        }

        // Log to translation_logs for backward compatibility
        if (user) {
          try {
            const supabaseClientWithAuth = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_ANON_KEY') ?? '',
              { global: { headers: { Authorization: authHeader } } }
            );
            
            await supabaseClientWithAuth.from('translation_logs').insert({
              user_id: user.id,
              target_language: targetLanguage,
              text_length: text.length,
            });
          } catch (logError) {
            console.error('Failed to log translation:', logError);
          }
        }

        return new Response(
          JSON.stringify({
            translatedText: cached.translated_content,
            sourceLanguage,
            targetLanguage,
            fromCache: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log('Cache miss, calling AI...', { cacheError: cacheError?.message });
      }
    } catch (error) {
      console.error('Cache lookup failed, proceeding with AI call:', error);
    }

    console.log('Calling Lovable AI for translation...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
        max_tokens: 3000,
      }),
    });

    console.log('Lovable AI response status:', response.status);

    const aiResponse = await response.json();
    
    if (!response.ok) {
      console.error('Lovable AI error:', aiResponse);
      
      // Handle rate limit errors
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please wait a moment and try again.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Handle payment required errors
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI service requires payment. Please contact support.' 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: aiResponse.error?.message || 'Translation service unavailable' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const translatedText = aiResponse.choices[0].message.content;
    console.log('Translation completed successfully');

    // Save to cache (non-blocking)
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      supabaseClient
        .from('translation_cache')
        .insert({
          content_hash: contentHash,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          original_content: text,
          translated_content: translatedText
        })
        .then(({ error }) => {
          if (error && error.code !== '23505') { // Ignore duplicate key errors
            console.error('Failed to save to cache:', error);
          } else {
            console.log('Translation saved to cache');
          }
        });
    } catch (error) {
      console.error('Cache save failed:', error);
    }

    // Log AI usage to ai_usage_logs
    try {
      const usage = aiResponse.usage || {};
      const inputTokens = usage.prompt_tokens || 0;
      const outputTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || inputTokens + outputTokens;
      
      // Gemini 2.5 Flash pricing: $0.075 per 1M input, $0.30 per 1M output
      const estimatedCost = (inputTokens / 1000000) * 0.075 + (outputTokens / 1000000) * 0.30;

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      await supabaseClient.from('ai_usage_logs').insert({
        user_id: user?.id || null,
        action_type: 'translation',
        model: 'google/gemini-2.5-flash',
        tokens_used: totalTokens,
        estimated_cost: estimatedCost,
        metadata: {
          source_language: sourceLanguage,
          target_language: targetLanguage,
          content_length: text.length,
          from_cache: false,
          cache_miss: true,
          input_tokens: inputTokens,
          output_tokens: outputTokens
        }
      });
      console.log('AI usage logged successfully');
    } catch (logError) {
      console.error('Failed to log AI usage:', logError);
      // Don't fail the request if logging fails
    }

    // Optional: Log to translation_logs for backward compatibility
    if (user) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        
        await supabaseClient.from('translation_logs').insert({
          user_id: user.id,
          target_language: targetLanguage,
          text_length: text.length,
        });
      } catch (logError) {
        console.error('Failed to log translation:', logError);
        // Don't fail the request if logging fails
      }
    }

    return new Response(
      JSON.stringify({
        translatedText,
        sourceLanguage,
        targetLanguage,
        fromCache: false
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
