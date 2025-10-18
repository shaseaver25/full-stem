import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStudentsByClass } from './useStudentData';
import { useQueryClient } from '@tanstack/react-query';
import { studentQueryKeys } from './useStudentData';

export interface Student {
  id: string;
  class_id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reading_level: string;
  learning_style: string;
  interests: string[];
  iep_accommodations: string[];
  language_preference: string;
  lesson_modifications?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  grade_level?: string;
  reading_level?: string;
  learning_style?: string;
  interests?: string[];
  iep_accommodations?: string[];
  language_preference?: string;
  lesson_modifications?: string[];
}

export interface UpdateStudentData {
  first_name?: string;
  last_name?: string;
  grade_level?: string;
  reading_level?: string;
  learning_style?: string;
  interests?: string[];
  iep_accommodations?: string[];
  language_preference?: string;
  lesson_modifications?: string[];
}

export interface DemoStudent extends Student {
  class_name: string;
}

export const useStudentManagement = (classId: string) => {
  const [demoStudents, setDemoStudents] = useState<DemoStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use the shared hook to fetch students with caching
  const { data: studentsData = [], isLoading: studentsLoading, refetch } = useStudentsByClass(classId);
  
  // Transform the data to ensure lesson_modifications is properly typed
  const students = studentsData.map(student => ({
    ...student,
    lesson_modifications: Array.isArray(student.lesson_modifications) 
      ? (student.lesson_modifications.filter((item): item is string => typeof item === 'string'))
      : []
  })) as Student[];

  const fetchDemoStudents = async () => {
    try {
      // First get the demo class IDs
      const { data: demoClasses, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .or('name.ilike.%demo%,name.ilike.%algebra%');

      if (classError) throw classError;

      if (!demoClasses || demoClasses.length === 0) {
        setDemoStudents([]);
        return;
      }

      const demoClassIds = demoClasses.map(cls => cls.id);

      // Then get students from those classes
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('*')
        .in('class_id', demoClassIds);

      if (studentError) throw studentError;
      
      const demoStudentsWithClass = students?.map(student => {
        const studentClass = demoClasses.find(cls => cls.id === student.class_id);
        return {
          ...student,
          lesson_modifications: Array.isArray(student.lesson_modifications) 
            ? (student.lesson_modifications.filter((item): item is string => typeof item === 'string'))
            : [],
          class_name: studentClass?.name || 'Unknown Class'
        };
      }) || [];
      
      setDemoStudents(demoStudentsWithClass as DemoStudent[]);
    } catch (error) {
      console.error('Error fetching demo students:', error);
    }
  };

  const addSelectedDemoStudents = async (selectedStudentIds: string[]) => {
    setLoading(true);
    try {
      const selectedStudents = demoStudents.filter(student => 
        selectedStudentIds.includes(student.id)
      );

      if (selectedStudents.length === 0) {
        toast({
          title: 'No Students Selected',
          description: 'Please select students to add to your class',
          variant: 'destructive'
        });
        return;
      }

      // Copy selected students to current class
      const studentsToInsert = selectedStudents.map(student => ({
        class_id: classId,
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        grade_level: student.grade_level || '',
        reading_level: student.reading_level || '',
        learning_style: student.learning_style || '',
        interests: student.interests || [],
        iep_accommodations: student.iep_accommodations || [],
        language_preference: student.language_preference || 'English',
        lesson_modifications: student.lesson_modifications || []
      }));

      const { error: insertError } = await supabase
        .from('students')
        .insert(studentsToInsert);

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: `Added ${studentsToInsert.length} students to your class`
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.byClass(classId) });
      await refetch();
    } catch (error) {
      console.error('Error adding students:', error);
      toast({
        title: 'Error',
        description: 'Failed to add students',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: CreateStudentData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .insert([{
          class_id: classId,
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          grade_level: studentData.grade_level || '',
          reading_level: studentData.reading_level || '',
          learning_style: studentData.learning_style || '',
          interests: studentData.interests || [],
          iep_accommodations: studentData.iep_accommodations || [],
          language_preference: studentData.language_preference || 'English',
          lesson_modifications: studentData.lesson_modifications || []
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student added successfully'
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.byClass(classId) });
      await refetch();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: 'Failed to add student',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addBulkStudents = async (studentsData: CreateStudentData[]) => {
    setLoading(true);
    try {
      const studentsToInsert = studentsData.map(studentData => ({
        class_id: classId,
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        grade_level: studentData.grade_level || '',
        reading_level: studentData.reading_level || '',
        learning_style: studentData.learning_style || '',
        interests: studentData.interests || [],
        iep_accommodations: studentData.iep_accommodations || [],
        language_preference: studentData.language_preference || 'English',
        lesson_modifications: studentData.lesson_modifications || []
      }));

      const { error } = await supabase
        .from('students')
        .insert(studentsToInsert);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Added ${studentsData.length} students successfully`
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.byClass(classId) });
      await refetch();
    } catch (error) {
      console.error('Error adding bulk students:', error);
      toast({
        title: 'Error',
        description: 'Failed to add students',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (studentId: string, studentData: UpdateStudentData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student updated successfully'
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.byClass(classId) });
      await refetch();
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (studentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student removed successfully'
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.byClass(classId) });
      await refetch();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove student',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    demoStudents,
    loading: loading || studentsLoading,
    fetchDemoStudents,
    addSelectedDemoStudents,
    addStudent,
    addBulkStudents,
    updateStudent,
    deleteStudent
  };
};