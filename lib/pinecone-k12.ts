import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

// Initialize Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
})

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Get the K-12 index
export const k12Index = pc.index(process.env.PINECONE_K12_INDEX_NAME || 'tailoredu-k12')

// Generate embedding from text using OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000) // Limit to ~8k chars to stay under token limit
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

// Store content in Pinecone
export async function storeContent(params: {
  id: string
  content: string
  metadata: {
    type: 'assignment' | 'lesson' | 'rubric' | 'quiz' | 'exemplar' | 'resource'
    title?: string
    grade?: number
    subject?: string
    skill?: string
    standardCode?: string
    createdBy?: string
    [key: string]: any
  }
}) {
  try {
    const embedding = await generateEmbedding(params.content)
    
    await k12Index.upsert([{
      id: params.id,
      values: embedding,
      metadata: {
        ...params.metadata,
        indexed_at: new Date().toISOString()
      }
    }])
    
    console.log(`✓ Stored content in Pinecone: ${params.id}`)
    return { success: true, id: params.id }
  } catch (error) {
    console.error('Error storing content in Pinecone:', error)
    throw error
  }
}

// Search for similar content by query text
export async function findSimilarContent(params: {
  query: string
  filters?: Record<string, any>
  topK?: number
}) {
  try {
    const queryEmbedding = await generateEmbedding(params.query)
    
    const results = await k12Index.query({
      vector: queryEmbedding,
      topK: params.topK || 10,
      filter: params.filters,
      includeMetadata: true
    })
    
    return results.matches
  } catch (error) {
    console.error('Error searching Pinecone:', error)
    throw error
  }
}

// Search by existing embedding (faster, for when you already have the embedding)
export async function searchByEmbedding(params: {
  embedding: number[]
  filters?: Record<string, any>
  topK?: number
}) {
  try {
    const results = await k12Index.query({
      vector: params.embedding,
      topK: params.topK || 10,
      filter: params.filters,
      includeMetadata: true
    })
    
    return results.matches
  } catch (error) {
    console.error('Error searching by embedding:', error)
    throw error
  }
}

// Batch upsert (for initial data loading)
export async function batchStoreContent(items: Array<{
  id: string
  content: string
  metadata: Record<string, any>
}>) {
  try {
    const vectors = await Promise.all(
      items.map(async (item) => {
        const embedding = await generateEmbedding(item.content)
        return {
          id: item.id,
          values: embedding,
          metadata: {
            ...item.metadata,
            indexed_at: new Date().toISOString()
          }
        }
      })
    )
    
    // Pinecone accepts batches of up to 100 vectors
    const batchSize = 100
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize)
      await k12Index.upsert(batch)
      console.log(`✓ Stored batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(vectors.length / batchSize)}`)
    }
    
    return { success: true, count: items.length }
  } catch (error) {
    console.error('Error batch storing content:', error)
    throw error
  }
}

// Delete content from Pinecone
export async function deleteContent(ids: string[]) {
  try {
    await k12Index.deleteMany(ids)
    console.log(`✓ Deleted ${ids.length} items from Pinecone`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting from Pinecone:', error)
    throw error
  }
}
