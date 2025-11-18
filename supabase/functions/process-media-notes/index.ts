import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { media_id, media_url, lesson_id } = await req.json();

    console.log('Processing media notes for:', {
      media_id,
      media_url,
      lesson_id
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save placeholder row in lesson_media_notes
    const { data: noteData, error: noteError } = await supabase
      .from('lesson_media_notes')
      .insert({
        media_id,
        summary_teacher: 'Processing…',
        summary_student: 'Processing…',
        themes: [],
        vocab_list: [],
        questions: {},
        translations: {},
        recommended_next: {}
      })
      .select()
      .single();

    if (noteError) {
      console.error('Error inserting placeholder:', noteError);
      throw noteError;
    }

    console.log('Placeholder row created:', noteData);

    // Detect media type and prepare for transcript processing
    let mediaType = 'unknown';
    let placeholderTranscript = 'Transcript processing is not implemented yet.';
    
    if (media_url.includes('youtube.com') || media_url.includes('youtu.be')) {
      mediaType = 'youtube';
      console.log('Detected YouTube video');
    } else if (media_url.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      mediaType = 'audio';
      console.log('Detected audio file');
    } else if (media_url.match(/\.(mp4|webm|mov)$/i)) {
      mediaType = 'video';
      console.log('Detected video file');
    }
    
    console.log(`Media type: ${mediaType}`);
    console.log(`Placeholder transcript: ${placeholderTranscript}`);
    
    // Process the transcript with Lovable AI
    try {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableApiKey) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }

      console.log('Processing transcript with Lovable AI...');

      const systemPrompt = `You are an educational content analyzer. Given a transcript, extract and generate comprehensive educational materials.`;
      
      const userPrompt = `Analyze this transcript and generate educational materials:

Transcript: ${placeholderTranscript}

Generate:
1. A detailed summary for teachers (150-200 words)
2. A simplified summary for students (100-150 words)
3. 3-5 key themes from the content
4. 5-10 vocabulary words with definitions
5. Comprehension questions (3 easy, 2 medium difficulty)
6. Reflection questions (2 open-ended questions)
7. One challenge question that requires critical thinking
8. Translations of the summary in Spanish (es), Somali (so), Hmong (hm), and Oromo (om)
9. 2-3 recommended next topics to explore`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'generate_educational_content',
              description: 'Generate structured educational content from a transcript',
              parameters: {
                type: 'object',
                properties: {
                  summary_teacher: { type: 'string', description: 'Detailed summary for teachers' },
                  summary_student: { type: 'string', description: 'Simplified summary for students' },
                  themes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Key themes from the content'
                  },
                  vocab_list: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        word: { type: 'string' },
                        definition: { type: 'string' }
                      },
                      required: ['word', 'definition']
                    },
                    description: 'Vocabulary words with definitions'
                  },
                  questions: {
                    type: 'object',
                    properties: {
                      comprehension: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Comprehension questions'
                      },
                      reflection: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Reflection questions'
                      },
                      challenge: { type: 'string', description: 'Challenge question' }
                    },
                    required: ['comprehension', 'reflection', 'challenge']
                  },
                  translations: {
                    type: 'object',
                    properties: {
                      es: { type: 'string', description: 'Spanish translation' },
                      so: { type: 'string', description: 'Somali translation' },
                      hm: { type: 'string', description: 'Hmong translation' },
                      om: { type: 'string', description: 'Oromo translation' }
                    },
                    required: ['es', 'so', 'hm', 'om']
                  },
                  recommended_next: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Recommended next topics'
                  }
                },
                required: ['summary_teacher', 'summary_student', 'themes', 'vocab_list', 'questions', 'translations', 'recommended_next'],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'generate_educational_content' } }
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('Lovable AI error:', aiResponse.status, errorText);
        throw new Error(`Lovable AI request failed: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      console.log('AI response received');

      // Extract the tool call result
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== 'generate_educational_content') {
        throw new Error('Invalid AI response format');
      }

      const generatedContent = JSON.parse(toolCall.function.arguments);
      console.log('Generated content:', generatedContent);

      // Update the lesson_media_notes with generated content
      const { error: updateError } = await supabase
        .from('lesson_media_notes')
        .update({
          summary_teacher: generatedContent.summary_teacher,
          summary_student: generatedContent.summary_student,
          themes: generatedContent.themes,
          vocab_list: generatedContent.vocab_list,
          questions: generatedContent.questions,
          translations: generatedContent.translations,
          recommended_next: generatedContent.recommended_next
        })
        .eq('id', noteData.id);

      if (updateError) {
        console.error('Error updating with generated content:', updateError);
        throw updateError;
      }

      console.log('Successfully updated lesson_media_notes with AI-generated content');

    } catch (aiError) {
      console.error('Error processing with AI:', aiError);
      
      // Update with error status but keep the placeholder
      await supabase
        .from('lesson_media_notes')
        .update({
          summary_teacher: `Error processing: ${aiError.message}`,
          summary_student: `Error processing: ${aiError.message}`
        })
        .eq('id', noteData.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Media notes processing triggered',
        media_id,
        note_id: noteData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error processing media notes:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
