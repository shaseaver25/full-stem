import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StudentAssignment {
  id: string;
  assignment_id: string;
  title: string;
  instructions: string;
  due_at: string | null;
  release_at: string | null;
  status: 'assigned' | 'draft' | 'submitted' | 'graded' | 'returned';
  submitted_at: string | null;
  assignment_status: 'not_released' | 'open' | 'closed';
  class_name: string;
  allow_resubmission: boolean;
  return_reason: string | null;
}

export const useStudentAssignments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student', 'assignments', user?.id],
    queryFn: async (): Promise<StudentAssignment[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get student's class enrollments and assignments
      const { data: submissions, error } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          assignment_id,
          status,
          submitted_at
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Get class assignments to get scheduling info and assignment details
      const assignmentIds = submissions?.map(s => s.assignment_id) || [];
      if (assignmentIds.length === 0) return [];

      const { data: classAssignments, error: classError } = await supabase
        .from('class_assignments_new')
        .select(`
          id,
          title,
          instructions,
          due_at,
          release_at,
          options,
          class_id,
          classes!inner(name)
        `)
        .in('id', assignmentIds);

      if (classError) throw classError;

      // Transform and combine data
      const now = new Date();
      const assignments: StudentAssignment[] = submissions?.map(submission => {
        const classAssignment = classAssignments?.find(ca => ca.id === submission.assignment_id);
        const releaseAt = classAssignment?.release_at ? new Date(classAssignment.release_at) : null;
        const dueAt = classAssignment?.due_at ? new Date(classAssignment.due_at) : null;
        
        let assignmentStatus: 'not_released' | 'open' | 'closed' = 'open';
        if (releaseAt && now < releaseAt) {
          assignmentStatus = 'not_released';
        } else if (dueAt && now > dueAt) {
          assignmentStatus = 'closed';
        }

        return {
          id: submission.id,
          assignment_id: submission.assignment_id,
          title: classAssignment?.title || 'Unknown Assignment',
          instructions: classAssignment?.instructions || '',
          due_at: classAssignment?.due_at || null,
          release_at: classAssignment?.release_at || null,
          status: submission.status as any,
          submitted_at: submission.submitted_at,
          assignment_status: assignmentStatus,
          class_name: classAssignment?.classes?.name || 'Unknown Class',
          allow_resubmission: (classAssignment?.options as any)?.allow_resubmission || false,
          return_reason: null
        };
      }) || [];

      return assignments;
    },
    enabled: !!user?.id
  });
};