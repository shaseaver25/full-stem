import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentAssignmentListItem {
  id: string;
  title: string;
  description?: string;
  due_at?: string;
  class_id: string;
  class_name: string;
  submission_status: 'not_submitted' | 'submitted';
  submitted_at?: string;
}

export const useStudentAssignmentsList = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-assignments-list', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // First get the student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError) throw studentError;
      if (!studentData) throw new Error('Student profile not found');

      // Get all enrolled classes
      const { data: enrollments, error: enrollError } = await supabase
        .from('class_students')
        .select('class_id, classes(id, name)')
        .eq('student_id', studentData.id)
        .eq('status', 'active');

      if (enrollError) throw enrollError;
      if (!enrollments || enrollments.length === 0) return [];

      const classIds = enrollments.map(e => e.class_id);

      // Get all assignments for these classes
      const { data: assignments, error: assignmentsError } = await supabase
        .from('class_assignments_new')
        .select(`
          id,
          title,
          description,
          due_at,
          class_id,
          release_at
        `)
        .in('class_id', classIds)
        .order('due_at', { ascending: true });

      if (assignmentsError) throw assignmentsError;
      if (!assignments) return [];

      // Get submissions for these assignments
      const assignmentIds = assignments.map(a => a.id);
      const { data: submissions, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('assignment_id, submitted_at, status')
        .in('assignment_id', assignmentIds)
        .eq('user_id', user.id);

      if (submissionsError) throw submissionsError;

      // Create submission map
      const submissionMap = new Map(
        submissions?.map(s => [s.assignment_id, s]) || []
      );

      // Combine data
      const result: StudentAssignmentListItem[] = assignments.map(assignment => {
        const classEnrollment = enrollments.find(e => e.class_id === assignment.class_id);
        const submission = submissionMap.get(assignment.id);
        
        return {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description || undefined,
          due_at: assignment.due_at || undefined,
          class_id: assignment.class_id,
          class_name: (classEnrollment?.classes as any)?.name || 'Unknown Class',
          submission_status: submission?.status === 'submitted' ? 'submitted' : 'not_submitted',
          submitted_at: submission?.submitted_at || undefined,
        };
      });

      return result;
    },
    enabled: !!user?.id,
  });
};
