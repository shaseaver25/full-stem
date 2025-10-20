import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Hook for student's own data
export function useStudentProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// Hook for student insights
export function useStudentInsights(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-insights', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('ai_feedback_history')
        .select('*')
        .eq('student_id', studentId)
        .eq('feedback_type', 'insight')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

// Hook for student goals
export function useStudentGoals(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-goals', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('student_goals')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

// Hook for updating goal status
export function useUpdateGoalStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ goalId, status }: { goalId: string; status: string }) => {
      const { data, error } = await supabase
        .from('student_goals')
        .update({ status })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-goals'] });
      toast({
        title: "Goal Updated",
        description: `Goal marked as ${data.status}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook for student reflections
export function useStudentReflections(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-reflections', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('student_reflections')
        .select(`
          *,
          student_goals:goal_id (
            id,
            goal_text
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

// Hook for creating reflection
export function useCreateReflection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      studentId,
      goalId,
      reflectionText,
      promptQuestion,
    }: {
      studentId: string;
      goalId?: string;
      reflectionText: string;
      promptQuestion?: string;
    }) => {
      const { data, error } = await supabase
        .from('student_reflections')
        .insert({
          student_id: studentId,
          goal_id: goalId || null,
          reflection_text: reflectionText,
          prompt_question: promptQuestion || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-reflections'] });
      toast({
        title: "Reflection Saved",
        description: "Your reflection has been recorded.",
      });
    },
  });
}

// Hook for student assignments
export function useStudentAssignments(userId: string | undefined) {
  return useQuery({
    queryKey: ['student-assignments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment:class_assignments_new!inner(title, due_at, max_points),
          grades:assignment_grades(grade, feedback, graded_at)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Hook for student stats
export function useStudentStats(studentId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['student-stats', studentId, userId],
    queryFn: async () => {
      if (!studentId || !userId) return null;

      // Fetch assignments with grades
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          grades:assignment_grades(grade)
        `)
        .eq('user_id', userId);

      const gradedSubmissions = submissions?.filter(s => s.grades && s.grades.length > 0) || [];
      const averageGrade = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.grades[0]?.grade || 0), 0) / gradedSubmissions.length
        : 0;

      const submittedCount = submissions?.filter(s => s.status === 'submitted' || s.status === 'graded').length || 0;
      const totalAssignments = submissions?.length || 0;
      const completionRate = totalAssignments > 0 ? (submittedCount / totalAssignments) * 100 : 0;

      return {
        averageGrade: averageGrade.toFixed(1),
        completionRate: completionRate.toFixed(1),
        submittedCount,
        totalAssignments,
      };
    },
    enabled: !!studentId && !!userId,
  });
}

// Hook for refreshing AI insights
export function useRefreshInsights() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { studentId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    },
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: ['student-insights', studentId] });
      toast({
        title: "Insights Updated",
        description: "Your learning insights have been refreshed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh insights",
        variant: "destructive",
      });
    },
  });
}

// Hook for weekly digest
export function useWeeklyDigest(studentId: string | undefined) {
  return useQuery({
    queryKey: ['weekly-digest', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      
      const { data, error } = await supabase
        .from('weekly_digests')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!studentId,
  });
}