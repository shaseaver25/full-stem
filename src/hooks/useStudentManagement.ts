import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

export interface DemoStudent extends Student {
  class_name: string;
}

export const useStudentManagement = (classId: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [demoStudents, setDemoStudents] = useState<DemoStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('first_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDemoStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes!inner(name)
        `)
        .or('classes.name.ilike.%demo%,classes.name.ilike.%algebra%');

      if (error) throw error;
      
      const demoStudentsWithClass = data?.map(student => ({
        ...student,
        class_name: student.classes?.name || 'Unknown Class'
      })) || [];
      
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
        language_preference: student.language_preference || 'English'
      }));

      const { error: insertError } = await supabase
        .from('students')
        .insert(studentsToInsert);

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: `Added ${studentsToInsert.length} students to your class`
      });

      await fetchStudents();
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
          language_preference: studentData.language_preference || 'English'
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student added successfully'
      });

      await fetchStudents();
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

      await fetchStudents();
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

      await fetchStudents();
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
    loading,
    fetchStudents,
    fetchDemoStudents,
    addSelectedDemoStudents,
    addStudent,
    updateStudent,
    deleteStudent
  };
};