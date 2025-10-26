import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from "npm:docx@8.5.0";

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
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        
        // Subtitle
        new Paragraph({
          children: [
            new TextRun({
              text: "Fill out this document to create a new lesson in the TailorEDU platform.",
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        
        // Guidelines box header
        new Paragraph({
          children: [
            new TextRun({
              text: "💡 Guidelines:",
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
          shading: {
            fill: "E8E8E8",
          },
        }),
        
        // Guidelines
        new Paragraph({
          children: [
            new TextRun({
              text: "• Do not remove or rename the ## Component headers.",
            }),
          ],
          spacing: { after: 50 },
          shading: {
            fill: "E8E8E8",
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• You may leave sections blank if not needed.",
            }),
          ],
          spacing: { after: 50 },
          shading: {
            fill: "E8E8E8",
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• Use plain text, not tables or images.",
            }),
          ],
          spacing: { after: 50 },
          shading: {
            fill: "E8E8E8",
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• When finished, upload this file in the Lesson Builder → Import Template tab.",
            }),
          ],
          spacing: { after: 200 },
          shading: {
            fill: "E8E8E8",
          },
        }),
        
        // Lesson Metadata Section
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
        
        // Metadata fields
        new Paragraph({
          children: [
            new TextRun({ text: "Title: ", bold: true }),
            new TextRun({ text: "____________________________", color: "CCCCCC" }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   Enter lesson title here",
              italics: true,
              color: "666666",
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Subject: ", bold: true }),
            new TextRun({ text: "____________________________", color: "CCCCCC" }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., Mathematics, Science, English",
              italics: true,
              color: "666666",
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Grade Level: ", bold: true }),
            new TextRun({ text: "____________________________", color: "CCCCCC" }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., 9-12, College",
              italics: true,
              color: "666666",
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Duration (minutes): ", bold: true }),
            new TextRun({ text: "____________________________", color: "CCCCCC" }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., 45, 90",
              italics: true,
              color: "666666",
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Reading Level: ", bold: true }),
            new TextRun({ text: "____________________________", color: "CCCCCC" }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., 9th grade, College",
              italics: true,
              color: "666666",
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Language: ", bold: true }),
            new TextRun({ text: "____________________________", color: "CCCCCC" }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   e.g., English, Spanish",
              italics: true,
              color: "666666",
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
              color: "666666",
            }),
          ],
          spacing: { after: 400 },
        }),
        
        // Component Sections
        ...createComponentSection(
          "Instructions",
          "Write the introduction or overview of the lesson here. This section appears first for students.",
          "Welcome to this lesson on photosynthesis! You'll learn how plants convert sunlight into energy."
        ),
        
        ...createComponentSection(
          "Page",
          "Include the main lesson content or reading material. You can add multiple pages if needed.",
          "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar."
        ),
        
        ...createComponentSection(
          "Multimedia",
          "Paste YouTube or Vimeo links here — one per line.",
          "https://www.youtube.com/watch?v=example123"
        ),
        
        ...createComponentSection(
          "Coding IDE",
          "Specify programming language and starter code if you want to include a coding activity.",
          "Language: Python\nStarter code:\nprint('Hello, World!')"
        ),
        
        ...createComponentSection(
          "Activity",
          "Describe an interactive activity for students to complete.",
          "In pairs, create a diagram showing the inputs and outputs of photosynthesis."
        ),
        
        ...createComponentSection(
          "Discussion",
          "Create a discussion question or topic for students to respond to.",
          "How does photosynthesis support life on Earth? Why is it crucial for our ecosystem?"
        ),
        
        ...createComponentSection(
          "Quiz",
          "Add quiz questions in this format:\nQ: Question text\nA: Correct answer\nB: Wrong answer\nC: Wrong answer\nD: Wrong answer",
          "Q: What do plants produce during photosynthesis?\nA: Oxygen and glucose\nB: Carbon dioxide\nC: Nitrogen\nD: Water only"
        ),
        
        ...createComponentSection(
          "Reflection",
          "Add a reflection prompt for students to think about what they learned.",
          "What surprised you most about how plants create energy? How might this knowledge change how you think about plants?"
        ),
        
        ...createComponentSection(
          "Assignment",
          "Describe the assignment task and submission requirements.",
          "Create a poster explaining photosynthesis to elementary students. Include diagrams and simple explanations. Submit as PDF."
        ),
        
        ...createComponentSection(
          "Resources",
          "List any additional materials or resources students might need.",
          "• Khan Academy: Photosynthesis video series\n• Biology textbook, Chapter 8\n• Lab materials: plant samples, microscope"
        ),
        
        // Final instructions
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
          children: [new TextRun({ text: "1. Fill in all sections with your content" })],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "2. Save this document" })],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "3. Upload the completed template to TailorEDU" })],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "4. Review the auto-generated lesson components" })],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "5. Publish your lesson!" })],
          spacing: { after: 100 },
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
          color: "666666",
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
          color: "005B99" 
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: example,
          italics: true,
          color: "999999",
        }),
      ],
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "[Your content here]",
          color: "CCCCCC",
        }),
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
