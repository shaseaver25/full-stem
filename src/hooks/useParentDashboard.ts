
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useParentProfile } from './useParentProfile';
import { useStudentData } from './useStudentData';
import { useStudentProgress } from './useStudentProgress';
import { useParentMessages } from './useParentMessages';

export const useParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const { parentProfile, fetchParentProfile } = useParentProfile();
  const { students, selectedStudent, setSelectedStudent, fetchStudents } = useStudentData();
  const { progress, fetchStudentProgress } = useStudentProgress();
  const { messages, fetchMessages, sendMessage } = useParentMessages();

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
