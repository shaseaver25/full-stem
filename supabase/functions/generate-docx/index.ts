import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip, BorderStyle } from "npm:docx@8.5.0";
import { Packer } from "npm:docx@8.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createWordTemplate(): Document {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
        },
      },
      children: [
        // Title
        new Paragraph({
          text: "TailorEDU Lesson Template",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          style: "Heading1",
        }),
        
        // Subtitle
        new Paragraph({
          text: "Fill out this document to create a new lesson in the TailorEDU platform.",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        
        // Guidelines box
        new Paragraph({
          children: [
            new TextRun({
              text: "💡 Guidelines:",
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
          shading: { fill: "E8E8E8" },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
        }),
        new Paragraph({
          text: "• Do not remove or rename the ## Component headers.",
          spacing: { after: 50 },
          shading: { fill: "E8E8E8" },
        }),
        new Paragraph({
          text: "• You may leave sections blank if not needed.",
          spacing: { after: 50 },
          shading: { fill: "E8E8E8" },
        }),
        new Paragraph({
          text: "• Use plain text, not tables or images.",
          spacing: { after: 50 },
          shading: { fill: "E8E8E8" },
        }),
        new Paragraph({
          text: "• When finished, upload this file in the Lesson Builder → Import Template tab.",
          spacing: { after: 200 },
          shading: { fill: "E8E8E8" },
        }),
        
        // Lesson Metadata Section
        new Paragraph({
          text: "# Lesson Metadata",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        
        ...createMetadataFields([
          { label: "Title", placeholder: "Enter lesson title here" },
          { label: "Subject", placeholder: "e.g., Mathematics, Science, English" },
          { label: "Grade Level", placeholder: "e.g., 9-12, College" },
          { label: "Duration (minutes)", placeholder: "e.g., 45, 90" },
          { label: "Reading Level", placeholder: "e.g., 9th grade, College" },
          { label: "Language", placeholder: "e.g., English, Spanish" },
        ]),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Description:", bold: true }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: "[Type a brief overview of what students will learn.]",
          italics: true,
          color: "666666",
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
          text: "Next Steps",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 },
        }),
        new Paragraph({
          text: "1. Fill in all sections with your content",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "2. Save this document",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "3. Upload the completed template to TailorEDU",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "4. Review the auto-generated lesson components",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "5. Publish your lesson!",
          spacing: { after: 100 },
        }),
      ],
    }],
  });
  
  return doc;
}

function createMetadataFields(fields: Array<{ label: string; placeholder: string }>): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  fields.forEach(field => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${field.label}: `, bold: true }),
          new TextRun({ text: "____________________________", color: "CCCCCC" }),
        ],
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: `   ${field.placeholder}`,
        italics: true,
        color: "666666",
        spacing: { after: 200 },
      })
    );
  });
  
  return paragraphs;
}

function createComponentSection(componentName: string, guidance: string, example: string): Paragraph[] {
  return [
    new Paragraph({
      text: `## Component: ${componentName}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      text: guidance,
      italics: true,
      color: "666666",
      spacing: { after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Example:", bold: true, italics: true, color: "005B99" }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: example,
      italics: true,
      color: "999999",
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: "[Your content here]",
      color: "CCCCCC",
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