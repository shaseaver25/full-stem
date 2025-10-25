import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📄 Generating TailorEDU Lesson Template...');

    // Generate a structured text template that can be converted to .docx
    const template = `TailorEDU Lesson Template
======================

INSTRUCTIONS FOR USE:
- Fill out all sections below
- Do NOT remove or rename the ## Component: headers
- Each ## Component: section will become a lesson component
- Leave sections blank if not needed
- Upload this file to TailorEDU when complete

---

# Lesson Metadata
Title: [Enter your lesson title here]
Subject: [e.g., Mathematics, Science, English]
Grade Level: [e.g., 9th Grade, High School]
Duration (minutes): [e.g., 45, 90]
Reading Level: [1-12, where 1 is easiest]
Language: en-US
Description: [Brief description of what students will learn]

---

## Component: Instructions
[Write the introduction or overview of the lesson here. This appears first and sets expectations for students.]

Example:
Welcome to this lesson on photosynthesis! In this lesson, you will learn how plants convert sunlight into energy. By the end, you'll understand the key steps in the photosynthesis process and be able to explain it in your own words.

---

## Component: Page
[Include the main body text, lesson explanation, or reading content here. This is the core instructional material.]

Example:
Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and glucose. This process occurs in the chloroplasts of plant cells and involves two main stages: the light-dependent reactions and the Calvin cycle.

The light-dependent reactions occur in the thylakoid membranes...

---

## Component: Multimedia
[Paste YouTube links or media URLs here. One URL per line.]

Example:
https://www.youtube.com/watch?v=example123
https://vimeo.com/example456

---

## Component: Coding IDE
[Insert code samples or programming activities here. Include language and starter code.]

Language: python

Starter Code:
# Write a function that calculates photosynthesis rate
def calculate_photosynthesis_rate(light_intensity, co2_level):
    # Your code here
    pass

---

## Component: Activity
[Describe a hands-on activity or guided task. Be specific about what students should do.]

Example:
Activity: Create a Photosynthesis Diagram

1. Draw a plant cell and label the chloroplast
2. Add arrows showing the inputs (sunlight, water, CO2)
3. Add arrows showing the outputs (glucose, oxygen)
4. Color-code the light-dependent and light-independent reactions

Materials needed: Paper, colored pencils, reference images

---

## Component: Discussion
[Add discussion prompts or peer-sharing topics. These encourage student interaction.]

Example:
Discussion Questions:
1. Why do you think plants appear green?
2. How would photosynthesis be different on a planet with red sunlight?
3. Share a time you observed photosynthesis in action (e.g., a plant growing toward light)

---

## Component: Quiz
[List questions and answers. Use Q: for questions and A: for correct answers.]

Example:
Q: What are the main inputs for photosynthesis?
A: Sunlight, water, and carbon dioxide

Q: Where in the plant cell does photosynthesis occur?
A: In the chloroplasts

Q: What are the two main products of photosynthesis?
A: Glucose (sugar) and oxygen

---

## Component: Reflection
[Add reflection questions or journaling prompts. Help students process what they learned.]

Example:
Reflection Prompts:
1. What was the most surprising thing you learned about photosynthesis?
2. How does understanding photosynthesis change the way you think about plants?
3. What questions do you still have about how plants make energy?

Write at least 3-5 sentences for each prompt.

---

## Component: Assignment
[Describe the graded work to be submitted. This section is automatically marked as assignable.]

Example:
Assignment: Photosynthesis Research Project

Task: Create a 2-page report on photosynthesis that includes:
- A diagram of the process with labels
- Explanation of light-dependent and light-independent reactions
- Real-world applications (how humans use photosynthesis)
- At least 3 credible sources cited

Rubric:
- Accuracy of scientific content (40%)
- Quality of diagram (30%)
- Writing clarity and organization (20%)
- Sources and citations (10%)

Due: [Teacher will set deadline]

---

## Component: Resources
[Provide reference links, PDFs, or file names of resources students can use.]

Example:
Resources:
- Khan Academy: Photosynthesis Overview
- Biology Textbook: Chapter 8, pages 142-156
- Interactive Simulation: https://phet.colorado.edu/photosynthesis
- Vocabulary List: photosynthesis_vocab.pdf

---

END OF TEMPLATE

Save this file and upload it to TailorEDU to automatically create your lesson with all components.
`;

    return new Response(template, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="TailorEDU_Lesson_Template.txt"'
      }
    });
  } catch (error) {
    console.error('❌ Error generating template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
