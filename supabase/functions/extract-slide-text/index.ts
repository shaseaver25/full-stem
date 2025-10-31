import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images } = await req.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Processing ${images.length} slide images`);

    // Process each image with Gemini Vision
    const extractedTexts = await Promise.all(
      images.map(async (imageData: string, index: number) => {
        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Extract all text from this slide image. Include the title, body text, bullet points, and any other visible text. Format it clearly with proper line breaks. If there are multiple text sections, separate them clearly. Return only the extracted text, no additional commentary.'
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: imageData
                      }
                    }
                  ]
                }
              ],
              max_tokens: 1000
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API error for slide ${index + 1}:`, response.status, errorText);
            return { slideNumber: index + 1, text: '', error: `API error: ${response.status}` };
          }

          const data = await response.json();
          const extractedText = data.choices?.[0]?.message?.content || '';
          
          console.log(`Extracted text from slide ${index + 1}: ${extractedText.substring(0, 100)}...`);
          
          return {
            slideNumber: index + 1,
            text: extractedText.trim()
          };
        } catch (error) {
          console.error(`Error processing slide ${index + 1}:`, error);
          return {
            slideNumber: index + 1,
            text: '',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return new Response(
      JSON.stringify({ slides: extractedTexts }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in extract-slide-text function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});