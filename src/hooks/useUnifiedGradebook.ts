import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useGradebook } from './useGradebook';
import { useAssignmentGradebook, AssignmentGradeRow } from './useAssignmentGradebook';
import type { Grade } from './useGradebook';

export interface UnifiedStudent {
  id: string;
  first_name: string;
  last_name: string;
  class_id: string;
  traditional_grades: Grade[];
  assignment_grades: AssignmentGradeRow[];
  overall_average?: number;
}

export interface GradebookOverview {
  total_students: number;
  average_grade: number;
  assignments_graded: number;
  traditional_grades_count: number;
  recent_activity: any[];
}

export const useUnifiedGradebook = (classId?: string) => {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>(classId || '');
  const [overview, setOverview] = useState<GradebookOverview | null>(null);
  const [unifiedStudents, setUnifiedStudents] = useState<UnifiedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  // Use both existing gradebook hooks
  const traditionalGradebook = useGradebook(selectedClassId);
  const assignmentGradebook = useAssignmentGradebook();

  const fetchClasses = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          grade_level,
          subject,
          teacher_id,
          teacher_profiles!inner(user_id)
        `)
        .eq('teacher_profiles.user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  };

  const combineGradebookData = async () => {
    if (!selectedClassId) return;

    setLoading(true);
    try {
      // Get students from the class
      // Get students via class_students junction table
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', selectedClassId)
        .eq('status', 'active');

      if (enrollmentError) throw enrollmentError;

      const studentIds = enrollmentData?.map(e => e.student_id) || [];

      if (studentIds.length === 0) {
        setUnifiedStudents([]);
        setLoading(false);
        return;
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          class_id
        `)
        .in('id', studentIds)
        .order('last_name');

      if (studentsError) throw studentsError;

      // Combine traditional grades and assignment grades for each student
      const combinedStudents: UnifiedStudent[] = (studentsData || []).map(student => {
        const traditionalGrades = traditionalGradebook.students.find(s => s.id === student.id)?.grades || [];
        const assignmentGrades = assignmentGradebook.grades.filter(g => g.student_name === `${student.first_name} ${student.last_name}`) || [];
        
        // Calculate overall average combining both grade types
        const traditionAvg = traditionalGrades.length > 0 
          ? traditionalGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / traditionalGrades.length 
          : null;
        
        const assignmentAvg = assignmentGrades.length > 0
          ? assignmentGrades.reduce((sum, grade) => sum + grade.grade, 0) / assignmentGrades.length
          : null;

        let overallAverage: number | undefined;
        if (traditionAvg !== null && assignmentAvg !== null) {
          overallAverage = (traditionAvg + assignmentAvg) / 2;
        } else if (traditionAvg !== null) {
          overallAverage = traditionAvg;
        } else if (assignmentAvg !== null) {
          overallAverage = assignmentAvg;
        }

        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          class_id: student.class_id,
          traditional_grades: traditionalGrades,
          assignment_grades: assignmentGrades,
          overall_average: overallAverage
        };
      });

      setUnifiedStudents(combinedStudents);

      // Calculate overview statistics
      const totalStudents = combinedStudents.length;
      const studentsWithGrades = combinedStudents.filter(s => s.overall_average !== undefined);
      const averageGrade = studentsWithGrades.length > 0
        ? studentsWithGrades.reduce((sum, s) => sum + (s.overall_average || 0), 0) / studentsWithGrades.length
        : 0;

      const assignmentsGraded = assignmentGradebook.grades.length;
      const traditionalGradesCount = traditionalGradebook.students.reduce((sum, s) => sum + s.grades.length, 0);

      setOverview({
        total_students: totalStudents,
        average_grade: averageGrade,
        assignments_graded: assignmentsGraded,
        traditional_grades_count: traditionalGradesCount,
        recent_activity: [] // TODO: Implement recent activity
      });

    } catch (error) {
      console.error('Error combining gradebook data:', error);
      toast({
        title: "Error",
        description: "Failed to load unified gradebook data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId && !traditionalGradebook.loading && !assignmentGradebook.loading) {
      combineGradebookData();
    }
  }, [selectedClassId, traditionalGradebook.loading, assignmentGradebook.loading, traditionalGradebook.students, assignmentGradebook.grades]);

  const exportUnifiedCSV = () => {
    const headers = [
      'Student Name',
      'Overall Average',
      'Traditional Grades Count', 
      'Assignment Grades Count'
    ];
    
    const csvContent = [
      headers.join(','),
      ...unifiedStudents.map(student => [
        `"${student.first_name} ${student.last_name}"`,
        student.overall_average?.toFixed(2) || 'N/A',
        student.traditional_grades.length,
        student.assignment_grades.length
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unified_gradebook.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    // Unified data
    unifiedStudents,
    overview,
    selectedClassId,
    setSelectedClassId,
    loading: loading || traditionalGradebook.loading || assignmentGradebook.loading,
    
    // Individual gradebook hooks for tab content
    traditionalGradebook,
    assignmentGradebook,
    
    // Utility functions
    fetchClasses,
    exportUnifiedCSV,
    refetch: combineGradebookData
  };
};