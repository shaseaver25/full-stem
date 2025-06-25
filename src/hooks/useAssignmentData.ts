
import { useQuery } from '@tanstack/react-query';
import { fetchAssignments, fetchSubmissions } from '@/services/assignmentService';
import { useAuth } from '@/contexts/AuthContext';

export const useAssignmentData = (lessonId: string) => {
  const { user } = useAuth();

  // Fetch assignments for this lesson
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments', lessonId],
    queryFn: () => fetchAssignments(lessonId),
  });

  // Fetch user's submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', lessonId, user?.id],
    queryFn: () => {
      if (!assignments?.length) return [];
      const assignmentIds = assignments.map(a => a.id);
      return fetchSubmissions(assignmentIds, user?.id || '');
    },
    enabled: !!user?.id && !!assignments?.length,
  });

  return {
    assignments,
    submissions,
    isLoading: assignmentsLoading || submissionsLoading,
  };
};
