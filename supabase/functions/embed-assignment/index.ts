import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmbedRequest {
  assignmentId: string
  content: string
  metadata: {
    grade_level?: string
    subject?: string
    skills?: string[]
    standards?: string[]
    difficulty_level?: string
    assignment_type?: string
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const pineconeApiKey = Deno.env.get('PINECONE_API_KEY')!
    const pineconeIndexName = Deno.env.get('PINECONE_K12_INDEX_NAME') || 'tailoredu-k12'
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { assignmentId, content, metadata }: EmbedRequest = await req.json()

    // Generate embedding using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: content.slice(0, 8000), // Limit to stay under token limit
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingResponse.statusText}`)
    }

    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding

    // Store in Pinecone
    const pineconeId = `assignment_${assignmentId}`
    const pineconeResponse = await fetch(
      `https://${pineconeIndexName}.svc.aped-4627-b74a.pinecone.io/vectors/upsert`,
      {
        method: 'POST',
        headers: {
          'Api-Key': pineconeApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vectors: [
            {
              id: pineconeId,
              values: embedding,
              metadata: {
                ...metadata,
                content_type: 'assignment',
                content_id: assignmentId,
                indexed_at: new Date().toISOString(),
              },
            },
          ],
        }),
      }
    )

    if (!pineconeResponse.ok) {
      const errorText = await pineconeResponse.text()
      throw new Error(`Pinecone API error: ${errorText}`)
    }

    // Store in content_embeddings table
    const { error: dbError } = await supabase
      .from('content_embeddings')
      .insert({
        content_id: assignmentId,
        content_type: 'assignment',
        pinecone_id: pineconeId,
        embedding_model: 'text-embedding-ada-002',
        metadata: metadata,
      })

    if (dbError) {
      console.error('Error storing embedding in database:', dbError)
      throw dbError
    }

    return new Response(
      JSON.stringify({
        success: true,
        pinecone_id: pineconeId,
        embedding_model: 'text-embedding-ada-002',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in embed-assignment function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})