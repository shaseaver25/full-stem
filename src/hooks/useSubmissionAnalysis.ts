import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisData {
  overall_mastery: 'novice' | 'developing' | 'proficient' | 'advanced';
  confidence_score: number;
  personalized_feedback: string;
  strengths: string[];
  areas_for_growth: string[];
  misconceptions?: string[];
  recommended_actions?: string[];
  rubric_scores?: Array<{
    criterion_name: string;
    score: number;
    max_score: number;
    feedback: string;
  }>;
}

export const useSubmissionAnalysis = (submissionId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['submission-analysis', submissionId, user?.id],
    queryFn: async (): Promise<AnalysisData | null> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('submission_analyses')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      // Transform database data to match AnalysisData interface
      return {
        overall_mastery: data.overall_mastery as 'novice' | 'developing' | 'proficient' | 'advanced',
        confidence_score: data.confidence_score,
        personalized_feedback: data.personalized_feedback,
        strengths: (data.strengths as string[]) || [],
        areas_for_growth: (data.areas_for_growth as string[]) || [],
        misconceptions: data.misconceptions ? (data.misconceptions as string[]) : undefined,
        recommended_actions: data.recommended_action ? [data.recommended_action as string] : undefined,
        rubric_scores: data.rubric_scores ? (data.rubric_scores as any[]) : undefined,
      };
    },
    enabled: !!user?.id && !!submissionId,
    refetchInterval: (data) => {
      // Keep polling if no analysis yet (every 3 seconds)
      return data ? false : 3000;
    },
  });
};

