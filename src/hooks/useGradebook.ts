
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Grade {
  id: string;
  student_id: string;
  lesson_id?: number;
  assignment_id?: string;
  category_id: string;
  points_earned?: number;
  points_possible: number;
  percentage?: number;
  letter_grade?: string;
  comments?: string;
  graded_by: string;
  graded_at: string;
  created_at: string;
  updated_at: string;
}

export interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface GradebookSummary {
  id: string;
  student_id: string;
  course_track: string;
  overall_percentage?: number;
  overall_letter_grade?: string;
  category_grades?: any;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

export interface StudentWithGrades {
  id: string;
  first_name: string;
  last_name: string;
  class_id: string;
  grades: Grade[];
  summary?: GradebookSummary;
}

export const useGradebook = (classId?: string) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithGrades[]>([]);
  const [categories, setCategories] = useState<GradeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchGradeCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('grade_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching grade categories:', error);
      toast({
        title: "Error",
        description: "Failed to load grade categories.",
        variant: "destructive",
      });
    }
  };

  const fetchStudentsWithGrades = async () => {
    if (!classId) return;

    try {
      // First, get student IDs from class_students junction table
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId)
        .eq('status', 'active');

      if (enrollmentError) throw enrollmentError;
      
      const studentIds = enrollmentData?.map(e => e.student_id) || [];
      
      if (studentIds.length === 0) {
        setStudents([]);
        return;
      }

      // Then fetch the student details
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds)
        .order('last_name');

      if (studentsError) throw studentsError;

      // Fetch grades for all students
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .in('student_id', studentIds)
        .order('graded_at', { ascending: false });

      if (gradesError) throw gradesError;

      // Fetch gradebook summaries
      const { data: summariesData, error: summariesError } = await supabase
        .from('gradebook_summary')
        .select('*')
        .in('student_id', studentIds)
        .eq('course_track', 'Excel');

      if (summariesError) throw summariesError;

      // Combine data
      const studentsWithGrades = studentsData?.map(student => ({
        ...student,
        grades: gradesData?.filter(grade => grade.student_id === student.id) || [],
        summary: summariesData?.find(summary => summary.student_id === student.id)
      })) || [];

      setStudents(studentsWithGrades);
    } catch (error) {
      console.error('Error fetching students with grades:', error);
      toast({
        title: "Error",
        description: "Failed to load gradebook data.",
        variant: "destructive",
      });
    }
  };

  const addGrade = async (gradeData: Omit<Grade, 'id' | 'graded_by' | 'graded_at' | 'created_at' | 'updated_at' | 'percentage' | 'letter_grade'>) => {
    if (!user) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('grades')
        .insert({
          ...gradeData,
          graded_by: user.id,
        });

      if (error) throw error;

      await fetchStudentsWithGrades();
      toast({
        title: "Success",
        description: "Grade added successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error adding grade:', error);
      toast({
        title: "Error",
        description: "Failed to add grade.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateGrade = async (gradeId: string, updates: Partial<Grade>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('grades')
        .update(updates)
        .eq('id', gradeId);

      if (error) throw error;

      await fetchStudentsWithGrades();
      toast({
        title: "Success",
        description: "Grade updated successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error updating grade:', error);
      toast({
        title: "Error",
        description: "Failed to update grade.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteGrade = async (gradeId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);

      if (error) throw error;

      await fetchStudentsWithGrades();
      toast({
        title: "Success",
        description: "Grade deleted successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast({
        title: "Error",
        description: "Failed to delete grade.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchGradeCategories(),
        fetchStudentsWithGrades()
      ]);
      setLoading(false);
    };

    fetchData();
  }, [classId]);

  return {
    students,
    categories,
    loading,
    saving,
    addGrade,
    updateGrade,
    deleteGrade,
    refetch: () => fetchStudentsWithGrades(),
  };
};
