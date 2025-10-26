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
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: "TailorEDU Lesson Template",
              bold: true,
              size: 32,
              color: "005B99",
            }),
          ],
          spacing: { after: 400 },
        }),
        
        // Subtitle
        new Paragraph({
          children: [
            new TextRun({
              text: "Fill out this document to create a new lesson in the TailorEDU platform.",
              size: 24,
            }),
          ],
          spacing: { after: 400 },
        }),
        
        // Guidelines
        new Paragraph({
          children: [
            new TextRun({
              text: "💡 Guidelines:",
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun("• Do not remove or rename the ## Component headers."),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun("• You may leave sections blank if not needed."),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun("• Use plain text, not tables or images."),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun("• When finished, upload this file in the Lesson Builder → Import Template tab."),
          ],
          spacing: { after: 400 },
        }),
        
        // Metadata Section Header
        new Paragraph({
          children: [
            new TextRun({
              text: "# Lesson Metadata",
              bold: true,
              size: 28,
              color: "005B99",
            }),
          ],
          spacing: { before: 400, after: 200 },
        }),
        
        // Metadata Fields
        new Paragraph({
          children: [
            new TextRun({ text: "Title: ", bold: true }),
            new TextRun("____________________________"),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   Enter lesson title here",
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Subject: ", bold: true }),
            new TextRun("____________________________"),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., Mathematics, Science, English",
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Grade Level: ", bold: true }),
            new TextRun("____________________________"),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., 9-12, College",
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Duration (minutes): ", bold: true }),
            new TextRun("____________________________"),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., 45, 90",
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Reading Level: ", bold: true }),
            new TextRun("____________________________"),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., 9th grade, College",
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Language: ", bold: true }),
            new TextRun("____________________________"),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., English, Spanish",
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Description:", bold: true }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "[Type a brief overview of what students will learn.]",
              italics: true,
            }),
          ],
          spacing: { after: 400 },
        }),
        
        // Components
        ...createComponentSection(
          "Instructions",
          "Write the introduction or overview of the lesson here.",
          "Welcome to this lesson on photosynthesis!"
        ),
        
        ...createComponentSection(
          "Page",
          "Include the main lesson content or reading material.",
          "Photosynthesis is the process by which plants use sunlight to create energy."
        ),
        
        ...createComponentSection(
          "Multimedia",
          "Paste YouTube or Vimeo links here — one per line.",
          "https://www.youtube.com/watch?v=example123"
        ),
        
        ...createComponentSection(
          "Coding IDE",
          "Specify programming language and starter code.",
          "Language: Python\nprint('Hello, World!')"
        ),
        
        ...createComponentSection(
          "Activity",
          "Describe an interactive activity for students.",
          "Create a diagram showing the inputs and outputs of photosynthesis."
        ),
        
        ...createComponentSection(
          "Discussion",
          "Create a discussion question or topic.",
          "How does photosynthesis support life on Earth?"
        ),
        
        ...createComponentSection(
          "Quiz",
          "Add quiz questions in this format: Q: Question, A: Answer, B: Wrong, etc.",
          "Q: What do plants produce?\nA: Oxygen and glucose\nB: Carbon dioxide"
        ),
        
        ...createComponentSection(
          "Reflection",
          "Add a reflection prompt for students.",
          "What surprised you most about how plants create energy?"
        ),
        
        ...createComponentSection(
          "Assignment",
          "Describe the assignment task and submission requirements.",
          "Create a poster explaining photosynthesis. Submit as PDF."
        ),
        
        ...createComponentSection(
          "Resources",
          "List additional materials or resources.",
          "• Khan Academy: Photosynthesis videos\n• Biology textbook, Chapter 8"
        ),
        
        // Next Steps
        new Paragraph({
          children: [
            new TextRun({
              text: "Next Steps",
              bold: true,
              size: 28,
              color: "005B99",
            }),
          ],
          spacing: { before: 600, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun("1. Fill in all sections with your content")],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun("2. Save this document")],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun("3. Upload the completed template to TailorEDU")],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun("4. Review the auto-generated lesson components")],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun("5. Publish your lesson!")],
        }),
      ],
    }],
  });
  
  return doc;
}

function createComponentSection(componentName: string, guidance: string, example: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `## Component: ${componentName}`,
          bold: true,
          size: 28,
          color: "005B99",
        }),
      ],
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: guidance,
          italics: true,
        }),
      ],
      spacing: { after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: "Example:", 
          bold: true, 
          italics: true,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: example,
          italics: true,
        }),
      ],
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun("[Your content here]"),
      ],
      spacing: { after: 400 },
    }),
  ];
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
