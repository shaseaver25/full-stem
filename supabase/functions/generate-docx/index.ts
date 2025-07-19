import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to create a proper RTF file that preserves formatting
function createRtfTemplate(content: string): Uint8Array {
  // RTF (Rich Text Format) is more reliable than trying to create DOCX without proper libraries
  const rtfHeader = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 `;
  const rtfFooter = `}`;
  
  // Convert plain text content to RTF format with proper formatting
  let rtfContent = content
    // Escape RTF special characters
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    // Convert formatting
    .replace(/^TAILOREDU LESSON PLAN TEMPLATE$/gm, '{\\b\\fs28 TAILOREDU LESSON PLAN TEMPLATE}\\par\\par')
    .replace(/^([A-Z][A-Z\s]+):$/gm, '{\\b $1:}\\par')
    .replace(/^- (.+)$/gm, '\\bullet $1\\par')
    .replace(/^\[(.+)\]$/gm, '{\\i [$1]}')
    .replace(/\[([^\]]+)\]/g, '{\\i [$1]}')
    // Convert line breaks
    .replace(/\n/g, '\\par\n');
  
  const fullRtf = rtfHeader + rtfContent + rtfFooter;
  
  const encoder = new TextEncoder();
  return encoder.encode(fullRtf);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType, customContent } = await req.json();

    let content = '';

    if (templateType === 'lesson-plan-template') {
      content = `TAILOREDU LESSON PLAN TEMPLATE

IMPORTANT INSTRUCTIONS:
Replace ALL text in [brackets] with your actual content. Remove the brackets entirely when you fill in the information.

Example:
WRONG: Lesson Title: [My Amazing Math Lesson]
RIGHT: Lesson Title: My Amazing Math Lesson

========================================

Lesson Title: [Enter your lesson title here]

Grade Level: [e.g., 5th Grade, High School, College Level, etc.]

Subject: [e.g., Mathematics, Science, Technology, etc.]

Duration: [e.g., 50 minutes, 90 minutes, etc.]

Video Link (Optional): [YouTube or other video URL]

Learning Objectives:
- [First learning objective]
- [Second learning objective] 
- [Third learning objective]

Written Instructions:
[Write detailed step-by-step instructions for students. Be specific about what students should do during the lesson. Use clear, actionable language.]

Assignment Instructions:
[Describe the assignment task clearly. Include what students need to complete, how to submit it, and any specific requirements or criteria.]

Discussion Prompt:
[Add a thoughtful question or topic that will generate meaningful class discussion]

Reflection Question (Optional):
[Add a question for students to reflect on their learning experience]

Rubric (Optional):
[Paste your grading rubric here or describe the criteria for assessment]

Additional Resources:
[List any additional materials, websites, books, or resources students might need]

Formative Assessment / Quiz:
[Include sample questions or describe how you will check student understanding during the lesson]

Graphing Tool Needed? [Yes/No]
If Yes, Desmos Tool Type: [Graphing Calculator / Geometry Tool]

========================================

NEXT STEPS:
1. Replace ALL bracketed sections with your actual content
2. Remove the brackets entirely - they are just placeholders
3. Save this document
4. Upload it to TailorEDU's lesson builder
5. Review the auto-generated components
6. Make any needed adjustments
7. Publish your lesson!

For best results, be as detailed and specific as possible in each section.`;
    } else if (customContent) {
      content = customContent;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Specify templateType or customContent.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate the RTF content
    const rtfBytes = createRtfTemplate(content);
    
    // Convert to base64 for transmission
    const base64Content = btoa(String.fromCharCode(...rtfBytes));

    return new Response(
      JSON.stringify({ 
        docxContent: base64Content,
        fileName: 'TailorEDU_Lesson_Plan_Template.rtf',
        mimeType: 'application/rtf'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-docx function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});