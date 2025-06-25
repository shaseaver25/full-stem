
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  lesson_id: number;
  title: string;
  instructions: string;
  file_types_allowed: string[];
  max_files: number;
  allow_text_response: boolean;
  created_at: string;
  updated_at: string;
}

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  text_response?: string;
  file_urls?: string[];
  file_names?: string[];
  file_types?: string[];
  submitted_at?: string;
  last_edited_at: string;
  status: 'draft' | 'submitted';
  created_at: string;
  updated_at: string;
}

export const useAssignments = (lessonId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [textResponse, setTextResponse] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch assignments for this lesson
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments', lessonId],
    queryFn: async (): Promise<Assignment[]> => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('lesson_id', parseInt(lessonId));

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', lessonId, user?.id],
    queryFn: async (): Promise<AssignmentSubmission[]> => {
      if (!user?.id || !assignments?.length) return [];

      const assignmentIds = assignments.map(a => a.id);
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .in('assignment_id', assignmentIds)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Type assertion to ensure status is properly typed
      return (data || []).map(submission => ({
        ...submission,
        status: submission.status as 'draft' | 'submitted'
      }));
    },
    enabled: !!user?.id && !!assignments?.length,
  });

  // Auto-save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async ({ assignmentId, textResponse, fileUrls, fileNames, fileTypes }: {
      assignmentId: string;
      textResponse: string;
      fileUrls: string[];
      fileNames: string[];
      fileTypes: string[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignmentId,
          user_id: user.id,
          text_response: textResponse,
          file_urls: fileUrls,
          file_names: fileNames,
          file_types: fileTypes,
          status: 'draft',
          last_edited_at: new Date().toISOString(),
        }, {
          onConflict: 'assignment_id,user_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (error) => {
      console.error('Error saving draft:', error);
    },
  });

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, textResponse, fileUrls, fileNames, fileTypes }: {
      assignmentId: string;
      textResponse: string;
      fileUrls: string[];
      fileNames: string[];
      fileTypes: string[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignmentId,
          user_id: user.id,
          text_response: textResponse,
          file_urls: fileUrls,
          file_names: fileNames,
          file_types: fileTypes,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          last_edited_at: new Date().toISOString(),
        }, {
          onConflict: 'assignment_id,user_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "✅ Assignment Submitted!",
        description: `Assignment submitted at ${new Date().toLocaleTimeString()}`,
      });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
      console.error('Error submitting assignment:', error);
    },
  });

  // File upload function
  const uploadFile = async (file: File, assignmentId: string): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${assignmentId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('assignment-files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('assignment-files')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Auto-save effect
  useEffect(() => {
    if (!assignments?.length || !textResponse.trim()) return;

    const timeoutId = setTimeout(() => {
      const assignment = assignments[0]; // For now, handle first assignment
      saveDraftMutation.mutate({
        assignmentId: assignment.id,
        textResponse,
        fileUrls: [],
        fileNames: [],
        fileTypes: [],
      });
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [textResponse, assignments]);

  return {
    assignments,
    submissions,
    isLoading: assignmentsLoading || submissionsLoading,
    textResponse,
    setTextResponse,
    uploadedFiles,
    setUploadedFiles,
    lastSaved,
    saveDraft: saveDraftMutation.mutate,
    submitAssignment: submitAssignmentMutation.mutate,
    isSubmitting: submitAssignmentMutation.isPending,
    uploadFile,
  };
};
