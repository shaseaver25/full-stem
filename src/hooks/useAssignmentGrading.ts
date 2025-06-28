
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AssignmentGradeData {
  submission_id: string;
  grade: number;
  feedback?: string;
}

export const useAssignmentGrading = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const submitGrade = async (gradeData: AssignmentGradeData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit grades.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('assignment_grades')
        .insert({
          submission_id: gradeData.submission_id,
          grader_user_id: user.id,
          grade: gradeData.grade,
          feedback: gradeData.feedback || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade submitted successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast({
        title: "Error",
        description: "Failed to submit grade. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitGrade,
    loading,
  };
};
