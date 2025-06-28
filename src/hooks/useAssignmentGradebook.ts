
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AssignmentGradeRow {
  id: string;
  student_name: string;
  assignment_title: string;
  grade: number;
  feedback?: string;
  graded_at: string;
  submission_id: string;
}

export const useAssignmentGradebook = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<AssignmentGradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentFilter, setAssignmentFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');

  const fetchGrades = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Query assignment_grades with joins to get student and assignment info
      const { data, error } = await supabase
        .from('assignment_grades')
        .select(`
          id,
          grade,
          feedback,
          graded_at,
          submission_id,
          assignment_submissions!inner(
            user_id,
            assignments!inner(
              title
            )
          )
        `)
        .eq('grader_user_id', user.id)
        .order('graded_at', { ascending: false });

      if (error) throw error;

      // Get user profiles for student names
      const userIds = data?.map(grade => grade.assignment_submissions.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Transform data to match our interface
      const transformedGrades: AssignmentGradeRow[] = data?.map(grade => ({
        id: grade.id,
        student_name: profiles?.find(p => p.id === grade.assignment_submissions.user_id)?.full_name || 'Unknown Student',
        assignment_title: grade.assignment_submissions.assignments.title,
        grade: grade.grade,
        feedback: grade.feedback,
        graded_at: new Date(grade.graded_at).toLocaleString(),
        submission_id: grade.submission_id,
      })) || [];

      setGrades(transformedGrades);
    } catch (error) {
      console.error('Error fetching assignment grades:', error);
      toast({
        title: "Error",
        description: "Failed to load assignment grades.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = async (gradeId: string, updates: { grade: number; feedback?: string }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assignment_grades')
        .update({
          grade: updates.grade,
          feedback: updates.feedback,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gradeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade updated successfully!",
      });

      // Refresh the grades list
      await fetchGrades();
      return true;
    } catch (error) {
      console.error('Error updating grade:', error);
      toast({
        title: "Error",
        description: "Failed to update grade. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [user]);

  // Filter grades based on assignment and student filters
  const filteredGrades = grades.filter(grade => {
    const matchesAssignment = assignmentFilter === '' || 
      grade.assignment_title.toLowerCase().includes(assignmentFilter.toLowerCase());
    const matchesStudent = studentFilter === '' || 
      grade.student_name.toLowerCase().includes(studentFilter.toLowerCase());
    return matchesAssignment && matchesStudent;
  });

  // Get unique assignments and students for filter options
  const uniqueAssignments = [...new Set(grades.map(g => g.assignment_title))];
  const uniqueStudents = [...new Set(grades.map(g => g.student_name))];

  // Calculate average grade per assignment
  const assignmentAverages = uniqueAssignments.map(assignment => {
    const assignmentGrades = grades.filter(g => g.assignment_title === assignment);
    const average = assignmentGrades.reduce((sum, g) => sum + g.grade, 0) / assignmentGrades.length;
    return { assignment, average: average.toFixed(1) };
  });

  return {
    grades: filteredGrades,
    loading,
    assignmentFilter,
    setAssignmentFilter,
    studentFilter,
    setStudentFilter,
    uniqueAssignments,
    uniqueStudents,
    assignmentAverages,
    refreshGrades: fetchGrades,
    updateGrade,
  };
};
