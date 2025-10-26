import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, Paragraph, TextRun, Packer } from "npm:docx@8.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createWordTemplate(): Document {
  const doc = new Document({
    sections: [{
      children: [
        // Title - simple without special formatting
        new Paragraph({
          children: [
            new TextRun({
              text: "TailorEDU Lesson Template",
              bold: true,
              size: 32,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("Fill out this document to create a new lesson in the TailorEDU platform."),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        // Guidelines
        new Paragraph({
          children: [
            new TextRun({
              text: "Guidelines:",
              bold: true,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("• Do not remove or rename the ## Component headers."),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("• You may leave sections blank if not needed."),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("• Use plain text, not tables or images."),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("• When finished, upload this file in the Lesson Builder."),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        // Metadata Section
        new Paragraph({
          children: [
            new TextRun({
              text: "# Lesson Metadata",
              bold: true,
              size: 28,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Title: ", bold: true }),
            new TextRun("____________________________"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Subject: ", bold: true }),
            new TextRun("____________________________"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Grade Level: ", bold: true }),
            new TextRun("____________________________"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Duration (minutes): ", bold: true }),
            new TextRun("____________________________"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Reading Level: ", bold: true }),
            new TextRun("____________________________"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Language: ", bold: true }),
            new TextRun("____________________________"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Description: ", bold: true }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("[Type a brief overview of what students will learn.]"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        // Component: Instructions
        new Paragraph({
          children: [
            new TextRun({
              text: "## Component: Instructions",
              bold: true,
              size: 24,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("Write the introduction or overview of the lesson here."),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("[Your content here]"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        // Component: Page
        new Paragraph({
          children: [
            new TextRun({
              text: "## Component: Page",
              bold: true,
              size: 24,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("Include the main lesson content or reading material."),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("[Your content here]"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        // Component: Multimedia
        new Paragraph({
          children: [
            new TextRun({
              text: "## Component: Multimedia",
              bold: true,
              size: 24,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("Paste YouTube or Vimeo links here — one per line."),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("[Your content here]"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        // Component: Quiz
        new Paragraph({
          children: [
            new TextRun({
              text: "## Component: Quiz",
              bold: true,
              size: 24,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("Add quiz questions in this format:"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("Q: Question text"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("A: Correct answer"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("B: Wrong answer"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("[Your content here]"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        // Component: Assignment
        new Paragraph({
          children: [
            new TextRun({
              text: "## Component: Assignment",
              bold: true,
              size: 24,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("Describe the assignment task and submission requirements."),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("[Your content here]"),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun(""),
          ],
        }),
        
        // Next Steps
        new Paragraph({
          children: [
            new TextRun({
              text: "Next Steps",
              bold: true,
              size: 24,
            }),
          ],
        }),
        
        new Paragraph({
          children: [
            new TextRun("1. Fill in all sections with your content"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("2. Save this document"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("3. Upload the completed template to TailorEDU"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("4. Review the auto-generated lesson components"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("5. Publish your lesson!"),
          ],
        }),
      ],
    }],
  });
  
  return doc;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating Word document template...');
    
    const doc = createWordTemplate();
    const buffer = await Packer.toBuffer(doc);
    
    console.log('Template generated, size:', buffer.length);

    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="TailorEDU_Lesson_Template.docx"',
        'Content-Length': buffer.length.toString(),
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
