import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a proper RTF file that opens cleanly in Word
function createWordCompatibleTemplate(): Uint8Array {
  const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}{\\f1 Arial;}}
{\\colortbl ;\\red54;\\green95;\\blue145;}
\\f0\\fs24

{\\f1\\b\\fs36\\cf1 TailorEDU Lesson Plan Template}\\par
\\par
{\\b Please fill in all sections below. Replace underlined areas with your content.}\\par
\\par

{\\f1\\b\\fs28\\cf1 Basic Information}\\par
\\par
{\\b Lesson Title: }{\\ul                                                                    }\\par
\\par
{\\b Subject: }{\\ul                                                                    }\\par
\\par
{\\b Grade Level: }{\\ul                                                                    }\\par
\\par
{\\b Duration: }{\\ul                                                                    }\\par
\\par

{\\f1\\b\\fs28\\cf1 Video Section (Optional)}\\par
\\par
{\\b Video URL: }{\\ul                                                                    }\\par
\\par

{\\f1\\b\\fs28\\cf1 Learning Objectives}\\par
\\par
{\\b List 3-5 specific learning objectives for this lesson:}\\par
\\par
1. {\\ul                                                                    }\\par
\\par
2. {\\ul                                                                    }\\par
\\par
3. {\\ul                                                                    }\\par
\\par
4. {\\ul                                                                    }\\par
\\par
5. {\\ul                                                                    }\\par
\\par

{\\f1\\b\\fs28\\cf1 Written Instructions}\\par
\\par
{\\b Provide detailed, step-by-step instructions for students:}\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par

{\\f1\\b\\fs28\\cf1 Assignment Instructions}\\par
\\par
{\\b Describe the assignment task and submission requirements:}\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par

{\\f1\\b\\fs28\\cf1 Discussion Prompt}\\par
\\par
{\\b Create a discussion question or topic:}\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par

{\\f1\\b\\fs28\\cf1 Assessment and Rubric}\\par
\\par
{\\b Describe how you will assess student learning:}\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par

{\\f1\\b\\fs28\\cf1 Desmos Integration}\\par
\\par
{\\b Do you need Desmos graphing tools?} \\u9744? Yes    \\u9744? No\\par
\\par
{\\b If yes, which type?} \\u9744? Graphing Calculator    \\u9744? Geometry Tool\\par
\\par

{\\f1\\b\\fs28\\cf1 Additional Resources}\\par
\\par
{\\b List any additional materials or resources needed:}\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par
{\\ul                                                                    }\\par
\\par

{\\f1\\b\\fs28\\cf1 Instructions}\\par
\\par
1. Fill in all underlined sections with your content\\par
2. Save this document (File > Save As > Word Document if needed)\\par
3. Upload the completed template to TailorEDU\\par
4. Review the auto-generated lesson components\\par
5. Publish your lesson!\\par
}`;

  const encoder = new TextEncoder();
  return encoder.encode(rtfContent);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating Word-compatible template...');
    
    const templateBytes = createWordCompatibleTemplate();
    
    console.log('Template generated, size:', templateBytes.length);

    return new Response(templateBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rtf',
        'Content-Disposition': 'attachment; filename="TailorEDU_Lesson_Plan_Template.rtf"',
        'Content-Length': templateBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating DOCX template:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate DOCX template',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});