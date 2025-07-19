import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to extract text from DOCX files
async function extractDocxText(fileBytes: Uint8Array): Promise<string> {
  try {
    console.log('Starting DOCX extraction, file size:', fileBytes.length);
    
    // Convert to string for pattern matching
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
    let content = decoder.decode(fileBytes);
    
    // DOCX files contain text in various XML patterns
    const extractedText = [];
    
    // Primary pattern: <w:t> tags (most common)
    const wtTagRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
    let match;
    while ((match = wtTagRegex.exec(content)) !== null) {
      if (match[1] && match[1].trim()) {
        extractedText.push(match[1].trim());
      }
    }
    
    // Secondary pattern: Look for text between > and < that looks like readable content
    const textContentRegex = />([A-Za-z0-9][^<>{]*[A-Za-z0-9])</g;
    while ((match = textContentRegex.exec(content)) !== null) {
      const text = match[1].trim();
      if (text.length > 3 && /[A-Za-z]/.test(text) && !text.includes('xml') && !text.includes('rel=')) {
        extractedText.push(text);
      }
    }
    
    console.log('Extracted text segments:', extractedText.length);
    
    if (extractedText.length > 0) {
      const result = extractedText.join(' ').replace(/\s+/g, ' ').trim();
      console.log('Final extracted text length:', result.length);
      return result;
    }
    
    // If XML parsing fails, try to extract readable text using different approach
    console.log('XML patterns failed, trying fallback extraction');
    
    // Remove binary data more aggressively
    let cleanText = content
      // Remove null bytes and control characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      // Keep letters, numbers, spaces, and basic punctuation
      .replace(/[^\x20-\x7E\u00A0-\u024F]/g, ' ')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // Look for sequences of readable text
    const readableSegments = cleanText.match(/[A-Za-z][A-Za-z0-9\s\.,;:!?\-'"()]{10,}/g);
    
    if (readableSegments && readableSegments.length > 0) {
      const result = readableSegments.join(' ').replace(/\s+/g, ' ').trim();
      console.log('Fallback extraction successful, length:', result.length);
      return result;
    }
    
    throw new Error('Unable to extract readable content from DOCX file');
    
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX file: ${error.message}`);
  }
}

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
      // For DOCX files, we'll extract text while trying to preserve basic formatting
      try {
        // DOCX files are zip archives containing XML files
        // We'll use a more sophisticated approach to extract formatted text
        
        // For now, we'll implement a basic DOCX text extraction
        // In production, you might want to use a proper DOCX parsing library
        const extractedContent = await extractDocxText(fileBytes);
        
        if (!extractedContent || extractedContent.length < 10) {
          return new Response(
            JSON.stringify({ 
              error: 'DOCX extraction failed',
              message: 'Unable to extract readable content from the Word document. Please save as .txt or copy the content manually.'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        extractedText = extractedContent;
      } catch (error) {
        console.error('DOCX extraction error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'DOCX processing failed',
            message: 'Please save your Word document as a .txt file or copy the content manually.',
            details: error.message
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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