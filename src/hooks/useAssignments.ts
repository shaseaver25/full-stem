
import { useState, useEffect } from 'react';
import { useAssignmentData } from '@/hooks/useAssignmentData';
import { useAssignmentMutations } from '@/hooks/useAssignmentMutations';

export const useAssignments = (lessonId: string) => {
  const [textResponse, setTextResponse] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { assignments, submissions, isLoading } = useAssignmentData(lessonId);
  const { lastSaved, saveDraft, submitAssignment, isSubmitting, uploadFile } = useAssignmentMutations();

  // Auto-save effect
  useEffect(() => {
    if (!assignments?.length || !textResponse.trim()) return;

    const timeoutId = setTimeout(() => {
      const assignment = assignments[0]; // For now, handle first assignment
      saveDraft({
        assignmentId: assignment.id,
        textResponse,
        fileUrls: [],
        fileNames: [],
        fileTypes: [],
      });
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [textResponse, assignments, saveDraft]);

  return {
    assignments,
    submissions,
    isLoading,
    textResponse,
    setTextResponse,
    uploadedFiles,
    setUploadedFiles,
    lastSaved,
    saveDraft,
    submitAssignment,
    isSubmitting,
    uploadFile,
  };
};
