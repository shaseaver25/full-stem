
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface RubricCriterion {
  id: string;
  rubric_id: string;
  name: string;
  description: string | null;
  max_points: number;
  order_index: number;
}

export interface Rubric {
  id: string;
  assignment_id: string;
  name: string;
  description: string | null;
  total_points: number;
  criteria: RubricCriterion[];
}

export interface RubricGrade {
  id: string;
  submission_id: string;
  criterion_id: string;
  points_earned: number;
  feedback: string | null;
}

export const useRubrics = (assignmentId?: string) => {
  const { user } = useAuth();
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRubrics = async () => {
    if (!user || !assignmentId) return;

    try {
      setLoading(true);
      
      // Fetch rubrics with their criteria
      const { data: rubricsData, error: rubricsError } = await supabase
        .from('rubrics')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (rubricsError) throw rubricsError;

      if (!rubricsData?.length) {
        setRubrics([]);
        return;
      }

      // Fetch criteria for all rubrics
      const rubricIds = rubricsData.map(r => r.id);
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('rubric_criteria')
        .select('*')
        .in('rubric_id', rubricIds)
        .order('order_index');

      if (criteriaError) throw criteriaError;

      // Combine rubrics with their criteria
      const rubricsWithCriteria: Rubric[] = rubricsData.map(rubric => ({
        ...rubric,
        criteria: criteriaData?.filter(c => c.rubric_id === rubric.id) || []
      }));

      setRubrics(rubricsWithCriteria);
    } catch (error) {
      console.error('Error fetching rubrics:', error);
      toast({
        title: "Error",
        description: "Failed to load rubrics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRubric = async (rubricData: {
    assignment_id: string;
    name: string;
    description?: string;
    criteria: Array<{
      name: string;
      description?: string;
      max_points: number;
    }>;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);

      // Create rubric
      const { data: rubric, error: rubricError } = await supabase
        .from('rubrics')
        .insert({
          assignment_id: rubricData.assignment_id,
          name: rubricData.name,
          description: rubricData.description || null,
        })
        .select()
        .single();

      if (rubricError) throw rubricError;

      // Create criteria
      if (rubricData.criteria.length > 0) {
        const criteriaToInsert = rubricData.criteria.map((criterion, index) => ({
          rubric_id: rubric.id,
          name: criterion.name,
          description: criterion.description || null,
          max_points: criterion.max_points,
          order_index: index,
        }));

        const { error: criteriaError } = await supabase
          .from('rubric_criteria')
          .insert(criteriaToInsert);

        if (criteriaError) throw criteriaError;
      }

      toast({
        title: "Success",
        description: "Rubric created successfully!",
      });

      await fetchRubrics();
      return true;
    } catch (error) {
      console.error('Error creating rubric:', error);
      toast({
        title: "Error",
        description: "Failed to create rubric.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRubrics();
  }, [user, assignmentId]);

  return {
    rubrics,
    loading,
    createRubric,
    refetch: fetchRubrics,
  };
};
