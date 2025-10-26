import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "npm:docx@8.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const components = [
  { name: 'Instructions', helpText: 'Write the introduction or overview of the lesson.' },
  { name: 'Page', helpText: 'Add the main instructional content.' },
  { name: 'Multimedia', helpText: 'Paste video or media links here (one per line).' },
  { name: 'Coding IDE', helpText: 'Insert code samples or programming activities.' },
  { name: 'Activity', helpText: 'Describe a hands-on or guided task.' },
  { name: 'Discussion', helpText: 'Add discussion prompts for students.' },
  { name: 'Quiz', helpText: 'List questions and answers using Q: and A:.' },
  { name: 'Reflection', helpText: 'Add reflection prompts or journaling questions.' },
  { name: 'Assignment', helpText: 'Describe graded work. This will be marked as assignable.' },
  { name: 'Resources', helpText: 'Provide reference links or filenames of resources.' },
];

function createLessonTemplateDocument(): Document {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "TailorEDU Lesson Template",
          bold: true,
          size: 32,
        }),
      ],
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Use this document to create lessons offline. Fill in each section, then upload it into the Lesson Builder → Import Template tab.",
          italics: true,
        }),
      ],
    })
  );

  children.push(new Paragraph({ text: "" }));

  // Instructions
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "💡 Instructions:",
          bold: true,
        }),
      ],
    })
  );

  children.push(new Paragraph("• Do NOT remove or rename the '## Component:' headers."));
  children.push(new Paragraph("• You may leave sections blank if not needed."));
  children.push(new Paragraph("• Use plain text (no images or tables)."));
  children.push(new Paragraph("• Save as .docx and upload it to TailorEDU."));
  children.push(new Paragraph({ text: "" }));

  // Lesson Metadata
  children.push(
    new Paragraph({
      text: "# Lesson Metadata",
      heading: HeadingLevel.HEADING_1,
    })
  );

  children.push(new Paragraph({ text: "" }));

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Title: ", bold: true }),
        new TextRun("________________________________"),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Subject: ", bold: true }),
        new TextRun("________________________________"),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Grade Level: ", bold: true }),
        new TextRun("________________________________"),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Duration (minutes): ", bold: true }),
        new TextRun("________________________________"),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Reading Level: ", bold: true }),
        new TextRun("________________________________"),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Language: ", bold: true }),
        new TextRun("en-US"),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Description: ", bold: true }),
        new TextRun({ text: "[Brief overview of what students will learn]", italics: true }),
      ],
    })
  );

  children.push(new Paragraph({ text: "" }));

  // Component Sections
  for (const component of components) {
    children.push(new Paragraph("---"));

    children.push(
      new Paragraph({
        text: `## Component: ${component.name}`,
        heading: HeadingLevel.HEADING_1,
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: component.helpText,
            italics: true,
          }),
        ],
      })
    );

    children.push(new Paragraph("[Write your content here...]"));
    children.push(new Paragraph({ text: "" }));
  }

  // Footer
  children.push(new Paragraph({ text: "" }));
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "END OF TEMPLATE",
          bold: true,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Save this file and upload it to TailorEDU to automatically create your lesson components.",
          italics: true,
        }),
      ],
    })
  );

  // Create and return the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return doc;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating TailorEDU Lesson Template .docx...');

    const doc = createLessonTemplateDocument();
    const buffer = await Packer.toBuffer(doc);

    console.log('Template generated successfully, size:', buffer.length);

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
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
