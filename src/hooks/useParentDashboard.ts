
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reading_level: string;
  class_name: string;
}

interface StudentProgress {
  lesson_id: number;
  lesson_title: string;
  status: string;
  progress_percentage: number;
  completed_at: string;
  time_spent: number;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  sender_type: string;
  is_read: boolean;
  priority: string;
  created_at: string;
  teacher_name: string;
  student_name: string;
}

export const useParentDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchParentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch parent profile
      const { data: parentProfile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!parentProfile) {
        toast({
          title: "Setup Required",
          description: "Please complete your parent profile setup",
          variant: "destructive"
        });
        return;
      }

      // Fetch students linked to this parent
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
        .eq('parent_id', parentProfile.id);

      const studentsData = studentRelationships?.map(rel => ({
        id: rel.students.id,
        first_name: rel.students.first_name,
        last_name: rel.students.last_name,
        grade_level: rel.students.grade_level,
        reading_level: rel.students.reading_level,
        class_name: rel.students.classes?.name || 'N/A'
      })) || [];

      setStudents(studentsData);
      if (studentsData.length > 0) {
        setSelectedStudent(studentsData[0]);
        await fetchStudentProgress(studentsData[0].id);
      }

      // Fetch messages
      await fetchMessages(parentProfile.id);

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
    } catch (error) {
      console.error('Error fetching student progress:', error);
    }
  };

  const fetchMessages = async (parentId: string) => {
    try {
      const { data } = await supabase
        .from('parent_teacher_messages')
        .select(`
          id,
          subject,
          message,
          sender_type,
          is_read,
          priority,
          created_at,
          teacher_id,
          students (first_name, last_name)
        `)
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (data) {
        // Get teacher info separately to avoid relation issues
        const messagesData = await Promise.all(
          data.map(async (msg) => {
            const { data: teacherProfile } = await supabase
              .from('teacher_profiles')
              .select('user_id')
              .eq('id', msg.teacher_id)
              .single();

            let teacherName = 'Teacher';
            if (teacherProfile) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', teacherProfile.user_id)
                .single();
              
              teacherName = profile?.full_name || 'Teacher';
            }

            return {
              id: msg.id,
              subject: msg.subject,
              message: msg.message,
              sender_type: msg.sender_type,
              is_read: msg.is_read,
              priority: msg.priority,
              created_at: msg.created_at,
              teacher_name: teacherName,
              student_name: `${msg.students?.first_name || ''} ${msg.students?.last_name || ''}`.trim()
            };
          })
        );

        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (messageData: {
    subject: string;
    message: string;
    priority: string;
    student_id: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: parentProfile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Get teacher for the student's class
      const { data: classData } = await supabase
        .from('students')
        .select('class_id, classes (teacher_id)')
        .eq('id', messageData.student_id)
        .single();

      if (!classData?.classes?.teacher_id) {
        throw new Error('No teacher found for this student');
      }

      const { error } = await supabase
        .from('parent_teacher_messages')
        .insert({
          parent_id: parentProfile.id,
          teacher_id: classData.classes.teacher_id,
          student_id: messageData.student_id,
          subject: messageData.subject,
          message: messageData.message,
          sender_type: 'parent',
          priority: messageData.priority
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully"
      });

      // Refresh messages
      await fetchMessages(parentProfile.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      throw error;
    }
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
    fetchStudentProgress,
    sendMessage
  };
};
