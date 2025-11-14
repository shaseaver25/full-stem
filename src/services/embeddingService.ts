import { supabase } from '@/integrations/supabase/client'

interface EmbeddingMetadata {
  grade_level?: string
  subject?: string
  skills?: string[]
  standards?: string[]
  difficulty_level?: string
  assignment_type?: string
}

export const embeddingService = {
  /**
   * Generate and store embedding for an assignment
   */
  async embedAssignment(
    assignmentId: string,
    content: string,
    metadata: EmbeddingMetadata
  ): Promise<{ success: boolean; pinecone_id?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('embed-assignment', {
        body: {
          assignmentId,
          content,
          metadata,
        },
      })

      if (error) {
        console.error('Error embedding assignment:', error)
        return { success: false, error: error.message }
      }

      return { success: true, pinecone_id: data.pinecone_id }
    } catch (error) {
      console.error('Error calling embed-assignment function:', error)
      return { success: false, error: (error as Error).message }
    }
  },

  /**
   * Extract content from assignment for embedding
   */
  extractAssignmentContent(assignment: {
    title: string
    description?: string
    instructions?: string
    selected_components?: any
  }): string {
    const parts: string[] = []

    if (assignment.title) parts.push(`Title: ${assignment.title}`)
    if (assignment.description) parts.push(`Description: ${assignment.description}`)
    if (assignment.instructions) parts.push(`Instructions: ${assignment.instructions}`)

    // Include component information if available
    if (assignment.selected_components) {
      const components = Array.isArray(assignment.selected_components)
        ? assignment.selected_components
        : []
      if (components.length > 0) {
        parts.push(`Components: ${components.join(', ')}`)
      }
    }

    return parts.join('\n\n')
  },

  /**
   * Extract metadata from class and assignment for embedding
   */
  async extractAssignmentMetadata(
    assignmentId: string,
    classId: string
  ): Promise<EmbeddingMetadata> {
    // Fetch class details for grade level and subject
    const { data: classData } = await supabase
      .from('classes')
      .select('grade_level, subject')
      .eq('id', classId)
      .single()

    // Fetch lesson details if assignment is linked to a lesson
    const { data: assignmentData } = await supabase
      .from('class_assignments_new')
      .select('lesson_id, options')
      .eq('id', assignmentId)
      .single()

    const metadata: EmbeddingMetadata = {
      grade_level: classData?.grade_level || undefined,
      subject: classData?.subject || undefined,
    }

    // Extract standards from lesson if available
    if (assignmentData?.lesson_id) {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('title, description, objectives')
        .eq('id', assignmentData.lesson_id)
        .single()

      if (lessonData?.objectives) {
        // Extract skills from lesson objectives if available
        metadata.skills = Array.isArray(lessonData.objectives) ? lessonData.objectives : []
      }
    }

    // Extract assignment type and difficulty from options
    if (assignmentData?.options) {
      const options = assignmentData.options as any
      if (options.grading_category) {
        metadata.assignment_type = options.grading_category
      }
      if (options.difficulty_level) {
        metadata.difficulty_level = options.difficulty_level
      }
    }

    return metadata
  },

  /**
   * Embed assignment with automatic content and metadata extraction
   */
  async embedAssignmentAuto(assignmentId: string, classId: string): Promise<void> {
    try {
      // Fetch assignment data
      const { data: assignment, error: fetchError } = await supabase
        .from('class_assignments_new')
        .select('*')
        .eq('id', assignmentId)
        .single()

      if (fetchError || !assignment) {
        console.error('Error fetching assignment:', fetchError)
        return
      }

      // Extract content and metadata
      const content = this.extractAssignmentContent(assignment)
      const metadata = await this.extractAssignmentMetadata(assignmentId, classId)

      // Generate and store embedding
      const result = await this.embedAssignment(assignmentId, content, metadata)

      if (!result.success) {
        console.error('Failed to embed assignment:', result.error)
      } else {
        console.log('✓ Assignment embedded successfully:', assignmentId)
      }
    } catch (error) {
      console.error('Error in embedAssignmentAuto:', error)
    }
  },

  /**
   * Search for similar assignments using text query
   */
  async findSimilarAssignments(
    query: string,
    filters?: Partial<EmbeddingMetadata>,
    topK: number = 10
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-similar-content', {
        body: {
          query,
          filters: {
            content_type: 'assignment',
            ...filters,
          },
          topK,
        },
      })

      if (error) {
        console.error('Error searching similar assignments:', error)
        return []
      }

      return data.matches || []
    } catch (error) {
      console.error('Error in findSimilarAssignments:', error)
      return []
    }
  },
}