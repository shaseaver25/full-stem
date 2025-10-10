import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GradedSubmission {
  id: string;
  grade?: number;
  feedback?: string;
  ai_feedback?: string;
  submitted_at: string;
  text_response?: string;
  assignment_id: string;
  assignment_title: string;
  class_name: string;
  due_at?: string;
}

export const useStudentGrades = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-grades', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get all submissions with grade information
      const { data: submissions, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          text_response,
          submitted_at,
          status,
          overrides,
          ai_feedback,
          assignment_id
        `)
        .eq('user_id', user.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      if (!submissions || submissions.length === 0) return [];

      // Get assignment IDs to fetch assignment details
      const assignmentIds = submissions.map(s => s.assignment_id);

      // Get assignment details
      const { data: assignments, error: assignmentsError } = await supabase
        .from('class_assignments_new')
        .select(`
          id,
          title,
          due_at,
          class_id
        `)
        .in('id', assignmentIds);

      if (assignmentsError) throw assignmentsError;

      // Get class IDs to fetch class names
      const classIds = [...new Set(assignments?.map(a => a.class_id) || [])];

      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds);

      if (classesError) throw classesError;

      // Create maps for quick lookup
      const assignmentMap = new Map(assignments?.map(a => [a.id, a]));
      const classMap = new Map(classes?.map(c => [c.id, c.name]));

      // Combine data
      const gradedSubmissions: GradedSubmission[] = submissions
        .map(submission => {
          const assignment = assignmentMap.get(submission.assignment_id);
          if (!assignment) return null;

          const overrides = submission.overrides as any;
          const grade = overrides?.grade;
          const feedback = overrides?.feedback;

          // Only include submissions that have been graded
          if (grade === null || grade === undefined) return null;

          return {
            id: submission.id,
            grade,
            feedback,
            ai_feedback: submission.ai_feedback || undefined,
            submitted_at: submission.submitted_at || '',
            text_response: submission.text_response || undefined,
            assignment_id: submission.assignment_id,
            assignment_title: assignment.title,
            class_name: classMap.get(assignment.class_id) || 'Unknown Class',
            due_at: assignment.due_at || undefined,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      return gradedSubmissions;
    },
    enabled: !!user?.id,
  });
};
