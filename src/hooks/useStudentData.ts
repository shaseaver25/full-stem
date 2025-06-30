
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reading_level: string;
  class_name: string;
}

export const useStudentData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchStudents = async (parentId: string) => {
    try {
      const { data: studentRelationships } = await supabase
        .from('student_parent_relationships')
        .select(`
          student_id,
          students (
            id,
            first_name,
            last_name,
            grade_level,
            reading_level,
            classes (name)
          )
        `)
        .eq('parent_id', parentId);

      const studentsData = studentRelationships?.map(rel => ({
        id: rel.students.id,
        first_name: rel.students.first_name,
        last_name: rel.students.last_name,
        grade_level: rel.students.grade_level,
        reading_level: rel.students.reading_level,
        class_name: rel.students.classes?.name || 'N/A'
      })) || [];

      setStudents(studentsData);
      if (studentsData.length > 0 && !selectedStudent) {
        setSelectedStudent(studentsData[0]);
      }

      return studentsData;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  return {
    students,
    selectedStudent,
    setSelectedStudent,
    fetchStudents
  };
};
