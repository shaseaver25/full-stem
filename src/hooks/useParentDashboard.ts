import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useParentProfile } from './useParentProfile';
import { useStudentProgress } from './useStudentProgress';
import { useParentMessages } from './useParentMessages';
import { supabase } from '@/integrations/supabase/client';

export const useParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const { toast } = useToast();
  
  const { parentProfile, fetchParentProfile } = useParentProfile();
  const { progress, fetchStudentProgress } = useStudentProgress();
  const { messages, fetchMessages, sendMessage } = useParentMessages();
  
  const fetchStudents = async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_parent_relationships')
        .select(`
          student_id,
          students (
            id,
            first_name,
            last_name,
            grade_level,
            class_id,
            classes (
              name
            )
          )
        `)
        .eq('parent_id', parentId);

      if (error) throw error;

      const studentsData = data?.map(rel => ({
        ...rel.students,
        class_name: rel.students?.classes?.name
      })) || [];

      setStudents(studentsData);
      return studentsData;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const fetchParentData = async () => {
    try {
      setLoading(true);
      
      const profile = await fetchParentProfile();
      if (!profile) return;

      const studentsData = await fetchStudents(profile.id);
      
      if (studentsData.length > 0) {
        await fetchStudentProgress(studentsData[0].id);
      }

      await fetchMessages(profile.id);
    } catch (error) {
      console.error('Error fetching parent data:', error);
      toast({
        title: "Error",
        description: "Failed to load parent dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentProgressFetch = async (studentId: string) => {
    await fetchStudentProgress(studentId);
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  return {
    students,
    selectedStudent,
    setSelectedStudent,
    progress,
    messages,
    loading,
    fetchParentData,
    fetchStudentProgress: handleStudentProgressFetch,
    sendMessage
  };
};
