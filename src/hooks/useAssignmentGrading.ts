
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { logUserAction, ActivityActions } from '@/utils/activityLogger';

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

      // Get submission and assignment details for logging
      const { data: submissionData } = await supabase
        .from('assignment_submissions')
        .select('user_id, assignment_id')
        .eq('id', gradeData.submission_id)
        .single();

      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', submissionData?.user_id)
        .single();

      // Get assignment and class details
      let assignmentTitle = null;
      let classTitle = null;
      if (submissionData?.assignment_id) {
        const { data: assignmentData } = await supabase
          .from('class_assignments_new')
          .select('title, class_id')
          .eq('id', submissionData.assignment_id)
          .single();

        assignmentTitle = assignmentData?.title;

        if (assignmentData?.class_id) {
          const { data: classData } = await supabase
            .from('classes')
            .select('name')
            .eq('id', assignmentData.class_id)
            .single();
          classTitle = classData?.name;
        }
      }

      // Log teacher activity
      await logUserAction({
        userId: user.id,
        role: 'teacher',
        action: ActivityActions.TEACHER.GRADE_ASSIGNMENT,
        details: {
          submission_id: gradeData.submission_id,
          assignment_title: assignmentTitle,
          class_title: classTitle,
          student_name: studentProfile?.full_name,
          grade: gradeData.grade,
        },
      });

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
