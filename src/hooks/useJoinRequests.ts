import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface JoinRequest {
  id: string;
  class_id: string;
  student_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  rejection_reason: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    user_id: string;
    email?: string; // email from the separate query
  };
  classes?: {
    name: string;
    teacher_id: string;
  };
}

interface RequestToJoinParams {
  classCode: string;
  message?: string;
}

interface RequestToJoinResult {
  success: boolean;
  request_id: string | null;
  class_name: string | null;
  error: string | null;
}

/**
 * Hook for students to request to join a class
 */
export const useRequestToJoinClass = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classCode, message }: RequestToJoinParams): Promise<RequestToJoinResult> => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .rpc('request_to_join_class', {
          _class_code: classCode,
          _student_user_id: user.id,
          _message: message || null
        })
        .single();

      if (error) {
        console.error('Error requesting to join class:', error);
        throw new Error('Failed to send join request');
      }

      return data as RequestToJoinResult;
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['studentJoinRequests'] });
        toast({
          title: '🎓 Request Sent!',
          description: `Your request to join ${result.class_name} has been sent to the teacher.`,
        });
      } else {
        toast({
          title: 'Unable to Join',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for students to view their own join requests
 */
export const useStudentJoinRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['studentJoinRequests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get student ID first
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!studentData) return [];

      const { data, error } = await supabase
        .from('classroom_join_requests')
        .select(`
          *,
          classes:class_id (
            name,
            teacher_id
          )
        `)
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching student join requests:', error);
        return [];
      }

      return data as JoinRequest[];
    },
    enabled: !!user,
  });
};

/**
 * Hook for teachers to view join requests for their classes
 */
export const useTeacherJoinRequests = (classId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teacherJoinRequests', classId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('classroom_join_requests')
        .select(`
          *,
          student:student_id (
            id,
            first_name,
            last_name,
            user_id
          ),
          classes:class_id (
            name,
            teacher_id
          )
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching teacher join requests:', error);
        return [];
      }

      // Fetch emails for students separately
      if (data && data.length > 0) {
        const userIds = data
          .map((r: any) => r.student?.user_id)
          .filter(Boolean);

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds);

          // Map emails to requests
          const emailMap = new Map(
            profiles?.map((p: any) => [p.id, p.email]) || []
          );

          return data.map((request: any) => ({
            ...request,
            student: request.student
              ? {
                  ...request.student,
                  email: emailMap.get(request.student.user_id),
                }
              : undefined,
          })) as JoinRequest[];
        }
      }

      return (data || []) as JoinRequest[];
    },
    enabled: !!user,
  });
};

/**
 * Hook for teachers to approve a join request
 */
export const useApproveJoinRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .rpc('approve_join_request', {
          _request_id: requestId,
          _teacher_user_id: user.id
        })
        .single();

      if (error) {
        console.error('Error approving join request:', error);
        throw new Error(error.message || 'Failed to approve request');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to approve request');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherJoinRequests'] });
      queryClient.invalidateQueries({ queryKey: ['classStudents'] });
      toast({
        title: '✅ Student Approved',
        description: 'The student has been added to your class.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for teachers to reject a join request
 */
export const useRejectJoinRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .rpc('reject_join_request', {
          _request_id: requestId,
          _teacher_user_id: user.id,
          _rejection_reason: reason || null
        })
        .single();

      if (error) {
        console.error('Error rejecting join request:', error);
        throw new Error(error.message || 'Failed to reject request');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to reject request');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherJoinRequests'] });
      toast({
        title: 'Request Rejected',
        description: 'The join request has been declined.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for students to cancel their own pending request
 */
export const useCancelJoinRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('classroom_join_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        console.error('Error canceling join request:', error);
        throw new Error('Failed to cancel request');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentJoinRequests'] });
      toast({
        title: 'Request Canceled',
        description: 'Your join request has been canceled.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
