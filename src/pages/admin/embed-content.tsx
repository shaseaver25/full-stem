import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function EmbedContentPage() {
  const [isEmbedding, setIsEmbedding] = useState(false)
  const [result, setResult] = useState<{ embedded: number; errors: number } | null>(null)
  const { toast } = useToast()

  const embedLessons = async () => {
    setIsEmbedding(true)
    setResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('embed-existing-content', {
        body: {
          content_type: 'lesson',
          limit: 100,
        },
      })

      if (error) throw error

      setResult(data)
      toast({
        title: 'Embedding Complete',
        description: `Embedded ${data.embedded} lessons with ${data.errors} errors`,
      })
    } catch (error) {
      console.error('Error embedding content:', error)
      toast({
        title: 'Error',
        description: 'Failed to embed content',
        variant: 'destructive',
      })
    } finally {
      setIsEmbedding(false)
    }
  }

  const embedContentLibrary = async () => {
    setIsEmbedding(true)
    setResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('embed-existing-content', {
        body: {
          content_type: 'content_library',
          limit: 100,
        },
      })

      if (error) throw error

      setResult(data)
      toast({
        title: 'Embedding Complete',
        description: `Embedded ${data.embedded} content items with ${data.errors} errors`,
      })
    } catch (error) {
      console.error('Error embedding content:', error)
      toast({
        title: 'Error',
        description: 'Failed to embed content',
        variant: 'destructive',
      })
    } finally {
      setIsEmbedding(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Embedding</h1>
        <p className="text-muted-foreground">
          Generate embeddings for existing content to enable AI-powered recommendations and search
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Embed Lessons</CardTitle>
            <CardDescription>
              Generate embeddings for all lessons in the Lessons table. This includes AI-Proof
              Assessments and other curriculum content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={embedLessons} disabled={isEmbedding}>
              {isEmbedding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Embedding...
                </>
              ) : (
                'Embed All Lessons'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embed Content Library</CardTitle>
            <CardDescription>
              Generate embeddings for published items in the content library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={embedContentLibrary} disabled={isEmbedding}>
              {isEmbedding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Embedding...
                </>
              ) : (
                'Embed Content Library'
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Successfully embedded:</strong> {result.embedded}
                </p>
                <p>
                  <strong>Errors:</strong> {result.errors}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}