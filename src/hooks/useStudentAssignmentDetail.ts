import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AssignmentDetail {
  id: string;
  title: string;
  description?: string;
  due_at?: string;
  release_at?: string;
  class_id: string;
  class_name: string;
  selected_components: any[];
  options: any;
}

export interface AssignmentSubmission {
  id: string;
  submission_text?: string;
  submission_link?: string;
  submitted_at?: string;
  status: string;
  grade?: number;
  feedback?: string;
}

export const useStudentAssignmentDetail = (assignmentId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-assignment-detail', assignmentId, user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!assignmentId) throw new Error('Assignment ID is required');

      // Get assignment details
      const { data: assignment, error: assignmentError } = await supabase
        .from('class_assignments_new')
        .select(`
          id,
          title,
          description,
          due_at,
          release_at,
          class_id,
          selected_components,
          options
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error('Assignment not found');

      // Get class name
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('name')
        .eq('id', assignment.class_id)
        .single();

      if (classError) throw classError;

      // Get student's submission if exists
      const { data: submission, error: submissionError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (submissionError) throw submissionError;

      const assignmentDetail: AssignmentDetail = {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description || undefined,
        due_at: assignment.due_at || undefined,
        release_at: assignment.release_at || undefined,
        class_id: assignment.class_id,
        class_name: (classData as any)?.name || 'Unknown Class',
        selected_components: Array.isArray(assignment.selected_components) ? assignment.selected_components : [],
        options: typeof assignment.options === 'object' ? assignment.options : {},
      };

      const overrides = submission?.overrides as any;
      const submissionDetail: AssignmentSubmission | null = submission ? {
        id: submission.id,
        submission_text: submission.text_response || undefined,
        submission_link: Array.isArray(submission.file_urls) ? submission.file_urls[0] : undefined,
        submitted_at: submission.submitted_at || undefined,
        status: submission.status,
        grade: overrides?.grade || undefined,
        feedback: overrides?.feedback || undefined,
      } : null;

      return {
        assignment: assignmentDetail,
        submission: submissionDetail,
      };
    },
    enabled: !!user?.id && !!assignmentId,
  });
};
