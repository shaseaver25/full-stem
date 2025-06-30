
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface representing student data structure
 * 
 * @interface Student
 * @property {string} id - Unique identifier for the student
 * @property {string} first_name - Student's first name
 * @property {string} last_name - Student's last name
 * @property {string} grade_level - Current grade level
 * @property {string} reading_level - Current reading level assessment
 * @property {string} class_name - Name of the class the student belongs to
 */
interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reading_level: string;
  class_name: string;
}

/**
 * Hook for managing student data and selection for parent portal
 * 
 * @description Provides functionality to fetch students associated with a parent,
 * manage student selection, and handle parent-student relationships.
 * 
 * @returns {Object} Student data management object
 * @returns {Student[]} returns.students - Array of students associated with parent
 * @returns {Student|null} returns.selectedStudent - Currently selected student
 * @returns {Function} returns.setSelectedStudent - Function to update selected student
 * @returns {Function} returns.fetchStudents - Function to fetch students by parent ID
 * 
 * @example
 * ```tsx
 * function ParentDashboard({ parentId }) {
 *   const { 
 *     students, 
 *     selectedStudent, 
 *     setSelectedStudent, 
 *     fetchStudents 
 *   } = useStudentData();
 *   
 *   useEffect(() => {
 *     if (parentId) {
 *       fetchStudents(parentId);
 *     }
 *   }, [parentId]);
 *   
 *   return (
 *     <div>
 *       <select onChange={(e) => setSelectedStudent(students[e.target.value])}>
 *         {students.map((student, index) => (
 *           <option key={student.id} value={index}>
 *             {student.first_name} {student.last_name}
 *           </option>
 *         ))}
 *       </select>
 *       
 *       {selectedStudent && (
 *         <div>
 *           Current student: {selectedStudent.first_name}
 *           Grade: {selectedStudent.grade_level}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @sideEffects
 * - Updates students state with fetched data
 * - Automatically selects first student if none selected
 * - Logs errors to console for debugging
 * - Handles database relationship queries
 */
export const useStudentData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  /**
   * Fetches all students associated with a specific parent
   * 
   * @param {string} parentId - The unique identifier for the parent
   * @returns {Promise<Student[]>} Promise resolving to array of student records
   * 
   * @example
   * ```tsx
   * const studentList = await fetchStudents('parent-123');
   * console.log(`Parent has ${studentList.length} children enrolled`);
   * ```
   */
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
