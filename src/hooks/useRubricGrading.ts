
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { RubricGrade } from './useRubrics';

export const useRubricGrading = (submissionId?: string) => {
  const { user } = useAuth();
  const [rubricGrades, setRubricGrades] = useState<RubricGrade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRubricGrades = async () => {
    if (!user || !submissionId) return;

    try {
      const { data, error } = await supabase
        .from('rubric_grades')
        .select('*')
        .eq('submission_id', submissionId);

      if (error) throw error;
      setRubricGrades(data || []);
    } catch (error) {
      console.error('Error fetching rubric grades:', error);
    }
  };

  const submitRubricGrades = async (grades: Array<{
    criterion_id: string;
    points_earned: number;
    feedback?: string;
  }>): Promise<boolean> => {
    if (!user || !submissionId) return false;

    try {
      setLoading(true);

      // Upsert rubric grades
      const gradesToUpsert = grades.map(grade => ({
        submission_id: submissionId,
        criterion_id: grade.criterion_id,
        points_earned: grade.points_earned,
        feedback: grade.feedback || null,
      }));

      const { error } = await supabase
        .from('rubric_grades')
        .upsert(gradesToUpsert, {
          onConflict: 'submission_id,criterion_id'
        });

      if (error) throw error;

      // Calculate total score and create overall grade
      const totalPoints = grades.reduce((sum, grade) => sum + grade.points_earned, 0);
      
      // Also create/update the overall assignment grade
      const { error: gradeError } = await supabase
        .from('assignment_grades')
        .upsert({
          submission_id: submissionId,
          grader_user_id: user.id,
          grade: totalPoints,
          feedback: 'Graded using rubric',
        }, {
          onConflict: 'submission_id'
        });

      if (gradeError) throw gradeError;

      toast({
        title: "Success",
        description: "Rubric grades submitted successfully!",
      });

      await fetchRubricGrades();
      return true;
    } catch (error) {
      console.error('Error submitting rubric grades:', error);
      toast({
        title: "Error",
        description: "Failed to submit rubric grades.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRubricGrades();
  }, [user, submissionId]);

  return {
    rubricGrades,
    loading,
    submitRubricGrades,
    refetch: fetchRubricGrades,
  };
};
