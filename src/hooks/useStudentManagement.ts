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

export interface DemoClass {
  id: string;
  name: string;
  student_count: number;
}

export const useStudentManagement = (classId: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [demoClasses, setDemoClasses] = useState<DemoClass[]>([]);
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

  const fetchDemoClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          students(count)
        `)
        .or('name.ilike.%demo%,name.ilike.%algebra%');

      if (error) throw error;
      
      const demoClassesWithCount = data?.map(cls => ({
        id: cls.id,
        name: cls.name,
        student_count: cls.students?.[0]?.count || 0
      })) || [];
      
      setDemoClasses(demoClassesWithCount);
    } catch (error) {
      console.error('Error fetching demo classes:', error);
    }
  };

  const copyStudentsFromDemoClass = async (sourceClassId: string) => {
    setLoading(true);
    try {
      // Fetch students from source class
      const { data: sourceStudents, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', sourceClassId);

      if (fetchError) throw fetchError;

      // Copy students to current class
      const studentsToInsert = sourceStudents?.map(student => ({
        class_id: classId,
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        grade_level: student.grade_level || '',
        reading_level: student.reading_level || '',
        learning_style: student.learning_style || '',
        interests: student.interests || [],
        iep_accommodations: student.iep_accommodations || [],
        language_preference: student.language_preference || 'English'
      })) || [];

      if (studentsToInsert.length === 0) {
        toast({
          title: 'No Students',
          description: 'No students found in the selected class',
          variant: 'destructive'
        });
        return;
      }

      const { error: insertError } = await supabase
        .from('students')
        .insert(studentsToInsert);

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: `Copied ${studentsToInsert.length} students to your class`
      });

      await fetchStudents();
    } catch (error) {
      console.error('Error copying students:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy students',
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
    demoClasses,
    loading,
    fetchStudents,
    fetchDemoClasses,
    copyStudentsFromDemoClass,
    addStudent,
    updateStudent,
    deleteStudent
  };
};