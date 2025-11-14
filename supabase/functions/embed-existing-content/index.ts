import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { content_type = 'lesson', limit = 100 } = await req.json()

    let embedded = 0
    let errors = 0

    if (content_type === 'lesson') {
      // Fetch existing lessons from Lessons table
      const { data: lessons, error: fetchError } = await supabase
        .from('Lessons')
        .select('*')
        .limit(limit)

      if (fetchError) throw fetchError

      console.log(`Found ${lessons?.length || 0} lessons to embed`)

      for (const lesson of lessons || []) {
        try {
          // Build content string from lesson
          const contentParts = []
          if (lesson.Title) contentParts.push(`Title: ${lesson.Title}`)
          if (lesson.Description) contentParts.push(`Description: ${lesson.Description}`)
          if (lesson.Text) contentParts.push(`Content: ${lesson.Text}`)

          const content = contentParts.join('\n\n')

          // Build metadata
          const metadata = {
            content_type: 'lesson',
            title: lesson.Title,
            track: lesson.Track,
            subject: lesson.Track, // Using Track as subject for now
            grade_level: 'K-12', // Default, can be enhanced
          }

          // Call embed-assignment function
          const { error: embedError } = await supabase.functions.invoke(
            'embed-assignment',
            {
              body: {
                assignmentId: `lesson_${lesson['Lesson ID']}`,
                content,
                metadata,
              },
            }
          )

          if (embedError) {
            console.error(`Error embedding lesson ${lesson['Lesson ID']}:`, embedError)
            errors++
          } else {
            embedded++
            console.log(`✓ Embedded lesson: ${lesson.Title}`)
          }
        } catch (error) {
          console.error(`Error processing lesson ${lesson['Lesson ID']}:`, error)
          errors++
        }
      }
    } else if (content_type === 'content_library') {
      // Fetch from content_library table
      const { data: content, error: fetchError } = await supabase
        .from('content_library')
        .select('*')
        .eq('is_published', true)
        .limit(limit)

      if (fetchError) throw fetchError

      console.log(`Found ${content?.length || 0} content items to embed`)

      for (const item of content || []) {
        try {
          const contentText = `Title: ${item.title}\n\nDescription: ${item.description || ''}`

          const metadata = {
            content_type: item.content_type,
            title: item.title,
            subject: item.subject,
            grade_level: item.grade_level,
            tags: item.tags,
          }

          const { error: embedError } = await supabase.functions.invoke(
            'embed-assignment',
            {
              body: {
                assignmentId: item.id,
                content: contentText,
                metadata,
              },
            }
          )

          if (embedError) {
            console.error(`Error embedding content ${item.id}:`, embedError)
            errors++
          } else {
            embedded++
            console.log(`✓ Embedded content: ${item.title}`)
          }
        } catch (error) {
          console.error(`Error processing content ${item.id}:`, error)
          errors++
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        embedded,
        errors,
        message: `Embedded ${embedded} items with ${errors} errors`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in embed-existing-content function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})