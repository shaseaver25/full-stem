import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, fileName, mimeType } = await req.json();

    if (!file || !fileName || !mimeType) {
      return new Response(
        JSON.stringify({ error: 'Missing file data, fileName, or mimeType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode base64 file
    const fileBytes = Uint8Array.from(atob(file), c => c.charCodeAt(0));

    let extractedText = '';

    if (mimeType === 'text/plain') {
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(fileBytes);
    } else if (mimeType === 'application/pdf') {
      // For PDF files, we'll use a simple approach
      // In a production environment, you might want to use a proper PDF parsing library
      
      // Simple text extraction - this is very basic and may not work for all PDFs
      // In production, consider using a proper PDF library or external service
      try {
        const decoder = new TextDecoder('utf-8');
        extractedText = decoder.decode(fileBytes);
        
        // Clean up the extracted text
        extractedText = extractedText
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
          
        // If the extraction didn't work well, provide helpful message
        if (extractedText.length < 50 || !extractedText.includes('Lesson Title')) {
          return new Response(
            JSON.stringify({ 
              error: 'PDF text extraction failed',
              message: 'Please convert your PDF to text format or copy the content manually.'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: 'PDF processing failed',
            message: 'Please convert your PDF to text format or copy the content manually.'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX files, we'll provide a helpful message
      // In production, you would use a proper DOCX parsing library
      return new Response(
        JSON.stringify({ 
          error: 'DOCX extraction not yet supported',
          message: 'Please save your Word document as a .txt file or copy the content manually.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});