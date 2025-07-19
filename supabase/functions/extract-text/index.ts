import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to extract text from DOCX files
async function extractDocxText(fileBytes: Uint8Array): Promise<string> {
  try {
    // DOCX files are ZIP archives. We need to extract the document.xml file
    // and parse the XML to extract text content
    
    // Convert Uint8Array to ArrayBuffer for zip processing
    const arrayBuffer = fileBytes.buffer.slice(fileBytes.byteOffset, fileBytes.byteOffset + fileBytes.byteLength);
    
    // For basic DOCX text extraction, we'll use a simple approach
    // In production, you would use a proper DOCX parsing library
    
    // Try to find text content in the binary data
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
    let content = decoder.decode(fileBytes);
    
    // Look for XML-like structures that contain text
    // DOCX documents contain text in <w:t> tags
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    const matches = [];
    let match;
    
    while ((match = textRegex.exec(content)) !== null) {
      if (match[1] && match[1].trim()) {
        matches.push(match[1].trim());
      }
    }
    
    if (matches.length > 0) {
      return matches.join(' ').replace(/\s+/g, ' ').trim();
    }
    
    // Fallback: try to extract any readable text
    // Remove binary data and keep only printable characters
    const cleanText = content
      .replace(/[\x00-\x1F\x7F-\xFF]/g, ' ') // Remove non-printable characters
      .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only ASCII printable chars and whitespace
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Look for common lesson plan keywords to validate extraction
    const keywords = ['lesson', 'title', 'grade', 'objective', 'instruction', 'assignment'];
    const hasKeywords = keywords.some(keyword => 
      cleanText.toLowerCase().includes(keyword)
    );
    
    if (cleanText.length > 50 && hasKeywords) {
      return cleanText;
    }
    
    throw new Error('Unable to extract meaningful content from DOCX file');
    
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX file');
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