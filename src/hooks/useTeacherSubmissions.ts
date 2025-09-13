import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface StudentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  status: 'assigned' | 'draft' | 'submitted' | 'graded' | 'returned';
  files: { path: string; name: string; size: number; uploaded_at: string }[];
  submitted_at: string | null;
  return_reason: string | null;
  student_name: string;
  student_email: string;
}

export const useTeacherSubmissions = (assignmentId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submissionsQuery = useQuery({
    queryKey: ['teacher', 'submissions', assignmentId],
    queryFn: async (): Promise<StudentSubmission[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          assignment_id,
          user_id,
          status,
          files,
          submitted_at,
          return_reason
        `)
        .eq('assignment_id', assignmentId);

      if (error) throw error;

      // Get student information through students table which has user_id
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          first_name,
          last_name
        `)
        .in('user_id', data?.map(s => s.user_id) || []);

      if (studentsError) console.warn('Students fetch error:', studentsError);

      // Get user emails from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', data?.map(s => s.user_id) || []);

      return data?.map(submission => {
        const student = students?.find(s => s.user_id === submission.user_id);
        const profile = profiles?.find(p => p.id === submission.user_id);
        return {
          ...submission,
          status: submission.status as 'assigned' | 'draft' | 'submitted' | 'graded' | 'returned',
          files: submission.files ? (typeof submission.files === 'string' ? JSON.parse(submission.files) : submission.files) : [],
          student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
          student_email: profile?.email || ''
        };
      }) || [];
    },
    enabled: !!user?.id && !!assignmentId
  });

  const requestResubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, reason }: { submissionId: string; reason: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          status: 'returned',
          return_reason: reason
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'submissions', assignmentId] });
      toast({
        title: "Resubmission requested",
        description: "The student has been notified to resubmit their work."
      });
    }
  });

  const createSignedUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('assignment-submissions')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  };

  return {
    submissions: submissionsQuery.data || [],
    isLoading: submissionsQuery.isLoading,
    error: submissionsQuery.error,
    requestResubmission: requestResubmissionMutation.mutate,
    isRequestingResubmission: requestResubmissionMutation.isPending,
    createSignedUrl
  };
};