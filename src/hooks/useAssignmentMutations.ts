
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveDraft, submitAssignment, uploadFile } from '@/services/assignmentService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAssignmentMutations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (params: {
      assignmentId: string;
      textResponse: string;
      fileUrls: string[];
      fileNames: string[];
      fileTypes: string[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return saveDraft({ ...params, userId: user.id });
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
    mutationFn: (params: {
      assignmentId: string;
      textResponse: string;
      fileUrls: string[];
      fileNames: string[];
      fileTypes: string[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return submitAssignment({ ...params, userId: user.id });
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
  const handleUploadFile = async (file: File, assignmentId: string): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');
    return uploadFile(file, assignmentId, user.id);
  };

  return {
    lastSaved,
    saveDraft: saveDraftMutation.mutate,
    submitAssignment: submitAssignmentMutation.mutate,
    isSubmitting: submitAssignmentMutation.isPending,
    uploadFile: handleUploadFile,
  };
};
