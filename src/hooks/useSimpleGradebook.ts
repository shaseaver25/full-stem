import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface GradebookStudent {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface GradebookAssignment {
  id: string;
  title: string;
  due_at?: string;
  max_points: number;
}

export interface GradebookGrade {
  submission_id: string;
  student_user_id: string;
  assignment_id: string;
  grade: number | null;
  feedback?: string;
  graded_at?: string;
}

export interface GradebookData {
  students: GradebookStudent[];
  assignments: GradebookAssignment[];
  grades: GradebookGrade[];
}

export const useSimpleGradebook = (classId?: string) => {
  const { user } = useAuth();
  const [data, setData] = useState<GradebookData>({
    students: [],
    assignments: [],
    grades: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchGradebookData = async () => {
    if (!classId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch students enrolled in the class
      const { data: studentsData, error: studentsError } = await supabase
        .from('class_students')
        .select(`
          student_id,
          students!inner (
            id,
            user_id,
            first_name,
            last_name
          )
        `)
        .eq('class_id', classId)
        .eq('status', 'active');

      if (studentsError) throw studentsError;

      const students: GradebookStudent[] = (studentsData || [])
        .map((item: any) => ({
          id: item.students.id,
          user_id: item.students.user_id,
          first_name: item.students.first_name,
          last_name: item.students.last_name,
        }))
        .filter((s) => s.user_id);

      // Get user profiles for emails
      const userIds = students.map(s => s.user_id);
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        if (profilesData) {
          students.forEach(student => {
            const profile = profilesData.find(p => p.id === student.user_id);
            if (profile) {
              student.email = profile.email;
            }
          });
        }
      }

      // Fetch assignments for the class
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('class_assignments_new')
        .select('id, title, due_at, max_points')
        .eq('class_id', classId)
        .order('due_at', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      const assignments: GradebookAssignment[] = (assignmentsData || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        due_at: a.due_at,
        max_points: a.max_points || 100,
      }));

      // Fetch all submissions and grades
      const assignmentIds = assignments.map(a => a.id);
      const grades: GradebookGrade[] = [];

      if (assignmentIds.length > 0 && userIds.length > 0) {
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select(`
            id,
            assignment_id,
            user_id,
            assignment_grades (
              grade,
              feedback,
              graded_at
            )
          `)
          .in('assignment_id', assignmentIds)
          .in('user_id', userIds);

        if (submissionsError) throw submissionsError;

        (submissionsData || []).forEach((sub: any) => {
          const gradeData = sub.assignment_grades?.[0];
          grades.push({
            submission_id: sub.id,
            student_user_id: sub.user_id,
            assignment_id: sub.assignment_id,
            grade: gradeData?.grade ?? null,
            feedback: gradeData?.feedback,
            graded_at: gradeData?.graded_at,
          });
        });
      }

      setData({ students, assignments, grades });
    } catch (error: any) {
      console.error('Error fetching gradebook:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load gradebook data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = async (
    submissionId: string,
    grade: number,
    feedback?: string
  ) => {
    try {
      setSaving(true);

      // Check if grade already exists
      const { data: existingGrade } = await supabase
        .from('assignment_grades')
        .select('id')
        .eq('submission_id', submissionId)
        .single();

      if (existingGrade) {
        // Update existing grade
        const { error } = await supabase
          .from('assignment_grades')
          .update({
            grade,
            feedback,
            graded_at: new Date().toISOString(),
          })
          .eq('submission_id', submissionId);

        if (error) throw error;
      } else {
        // Insert new grade
        const { error } = await supabase
          .from('assignment_grades')
          .insert({
            submission_id: submissionId,
            grader_user_id: user!.id,
            grade,
            feedback,
          });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Grade saved successfully',
      });

      // Refresh data
      await fetchGradebookData();
    } catch (error: any) {
      console.error('Error updating grade:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save grade',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateStudentAverage = (studentUserId: string): number | null => {
    const studentGrades = data.grades.filter(
      (g) => g.student_user_id === studentUserId && g.grade !== null
    );

    if (studentGrades.length === 0) return null;

    const total = studentGrades.reduce((sum, g) => sum + (g.grade || 0), 0);
    return Math.round((total / studentGrades.length) * 100) / 100;
  };

  const calculateAssignmentAverage = (assignmentId: string): number | null => {
    const assignmentGrades = data.grades.filter(
      (g) => g.assignment_id === assignmentId && g.grade !== null
    );

    if (assignmentGrades.length === 0) return null;

    const total = assignmentGrades.reduce((sum, g) => sum + (g.grade || 0), 0);
    return Math.round((total / assignmentGrades.length) * 100) / 100;
  };

  useEffect(() => {
    fetchGradebookData();
  }, [classId]);

  return {
    ...data,
    loading,
    saving,
    updateGrade,
    calculateStudentAverage,
    calculateAssignmentAverage,
    refetch: fetchGradebookData,
  };
};
