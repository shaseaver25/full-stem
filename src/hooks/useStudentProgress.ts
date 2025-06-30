
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface representing student progress data
 * 
 * @interface StudentProgress
 * @property {number} lesson_id - Unique identifier for the lesson
 * @property {string} lesson_title - Title of the lesson
 * @property {string} status - Current status of lesson progress
 * @property {number} progress_percentage - Completion percentage (0-100)
 * @property {string} completed_at - Timestamp when lesson was completed
 * @property {number} time_spent - Time spent on lesson in minutes
 */
interface StudentProgress {
  lesson_id: number;
  lesson_title: string;
  status: string;
  progress_percentage: number;
  completed_at: string;
  time_spent: number;
}

/**
 * Hook for managing student progress data and tracking
 * 
 * @description Provides functionality to fetch and manage student learning progress
 * across different lessons. Handles data transformation from database relations.
 * 
 * @returns {Object} Student progress management object
 * @returns {StudentProgress[]} returns.progress - Array of student progress records
 * @returns {Function} returns.fetchStudentProgress - Function to fetch progress by student ID
 * 
 * @example
 * ```tsx
 * function StudentProgressDashboard({ studentId }) {
 *   const { progress, fetchStudentProgress } = useStudentProgress();
 *   
 *   useEffect(() => {
 *     if (studentId) {
 *       fetchStudentProgress(studentId);
 *     }
 *   }, [studentId]);
 *   
 *   return (
 *     <div>
 *       {progress.map(item => (
 *         <div key={item.lesson_id}>
 *           {item.lesson_title}: {item.progress_percentage}% complete
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @sideEffects
 * - Updates progress state with fetched data
 * - Logs errors to console for debugging
 * - Transforms database relations into usable format
 */
export const useStudentProgress = () => {
  const [progress, setProgress] = useState<StudentProgress[]>([]);

  /**
   * Fetches student progress data for a specific student
   * 
   * @param {string} studentId - The unique identifier for the student
   * @returns {Promise<StudentProgress[]>} Promise resolving to array of progress records
   * 
   * @example
   * ```tsx
   * const progressData = await fetchStudentProgress('student-123');
   * console.log(`Found ${progressData.length} progress records`);
   * ```
   */
  const fetchStudentProgress = async (studentId: string) => {
    try {
      const { data } = await supabase
        .from('student_progress')
        .select(`
          lesson_id,
          status,
          progress_percentage,
          completed_at,
          time_spent,
          Lessons (Title)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      const progressData = data?.map(item => ({
        lesson_id: item.lesson_id,
        lesson_title: item.Lessons?.Title || 'Unknown Lesson',
        status: item.status,
        progress_percentage: item.progress_percentage,
        completed_at: item.completed_at,
        time_spent: item.time_spent
      })) || [];

      setProgress(progressData);
      return progressData;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return [];
    }
  };

  return {
    progress,
    fetchStudentProgress
  };
};
