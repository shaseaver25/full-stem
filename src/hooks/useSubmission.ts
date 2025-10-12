import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { logUserAction, ActivityActions } from '@/utils/activityLogger';

interface FileInfo {
  path: string;
  name: string;
  size: number;
  uploaded_at: string;
}

interface SubmissionData {
  id: string;
  assignment_id: string;
  user_id: string;
  status: 'assigned' | 'draft' | 'submitted' | 'graded' | 'returned';
  files: FileInfo[];
  text_response: string | null;
  submitted_at: string | null;
  return_reason: string | null;
}

export const useSubmission = (assignmentId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submissionQuery = useQuery({
    queryKey: ['submission', assignmentId, user?.id],
    queryFn: async (): Promise<SubmissionData> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create initial submission record
        const { data: newSubmission, error: insertError } = await supabase
          .from('assignment_submissions')
          .insert({
            assignment_id: assignmentId,
            user_id: user.id,
            status: 'assigned',
            files: []
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return {
          ...newSubmission,
          status: newSubmission.status as 'assigned' | 'draft' | 'submitted' | 'graded' | 'returned',
          files: []
        };
      }

      return {
        ...data,
        status: data.status as 'assigned' | 'draft' | 'submitted' | 'graded' | 'returned',
        files: data.files ? (typeof data.files === 'string' ? JSON.parse(data.files) : data.files) : []
      };
    },
    enabled: !!user?.id && !!assignmentId
  });

  const addFileMutation = useMutation({
    mutationFn: async (fileInfo: FileInfo) => {
      if (!user?.id) throw new Error('User not authenticated');

      const currentFiles = submissionQuery.data?.files || [];
      const updatedFiles = [...currentFiles, fileInfo];

      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          files: updatedFiles as any,
          status: 'draft'
        })
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, files: updatedFiles };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', assignmentId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['student', 'assignments', user?.id] });
    }
  });

  const removeFileMutation = useMutation({
    mutationFn: async (fileIndex: number) => {
      if (!user?.id) throw new Error('User not authenticated');

      const currentFiles = submissionQuery.data?.files || [];
      const fileToRemove = currentFiles[fileIndex];
      
      if (fileToRemove) {
        // Remove from storage
        const { error: storageError } = await supabase.storage
          .from('assignment-submissions')
          .remove([fileToRemove.path]);

        if (storageError) console.error('Storage deletion error:', storageError);
      }

      const updatedFiles = currentFiles.filter((_, index) => index !== fileIndex);

      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          files: updatedFiles as any,
          status: updatedFiles.length > 0 ? 'draft' : 'assigned'
        })
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, files: updatedFiles };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', assignmentId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['student', 'assignments', user?.id] });
      toast({
        title: "File removed",
        description: "The file has been removed from your submission."
      });
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Get assignment details for logging
      const { data: assignmentData } = await supabase
        .from('class_assignments_new')
        .select('title, class_id')
        .eq('id', assignmentId)
        .single();

      let classTitle = null;
      if (assignmentData?.class_id) {
        const { data: classData } = await supabase
          .from('classes')
          .select('name')
          .eq('id', assignmentData.class_id)
          .single();
        classTitle = classData?.name;
      }

      // Log activity
      await logUserAction({
        userId: user.id,
        role: 'student',
        action: ActivityActions.STUDENT.SUBMIT_ASSIGNMENT,
        details: {
          assignment_id: assignmentId,
          assignment_title: assignmentData?.title,
          class_title: classTitle,
          submitted_at: new Date().toISOString(),
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', assignmentId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['student', 'assignments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activity-log'] });
      toast({
        title: "Assignment submitted!",
        description: `Your assignment was submitted at ${new Date().toLocaleTimeString()}.`
      });
    }
  });

  const resubmitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          status: 'draft',
          submitted_at: null,
          return_reason: null
        })
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', assignmentId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['student', 'assignments', user?.id] });
      toast({
        title: "Resubmission enabled",
        description: "You can now make changes and resubmit your assignment."
      });
    }
  });

  return {
    submission: submissionQuery.data,
    isLoading: submissionQuery.isLoading,
    error: submissionQuery.error,
    addFile: addFileMutation.mutate,
    removeFile: removeFileMutation.mutate,
    submit: submitMutation.mutate,
    resubmit: resubmitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    isRemoving: removeFileMutation.isPending
  };
};