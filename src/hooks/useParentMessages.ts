
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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

export const useParentMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

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
        return messagesData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
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

  return {
    messages,
    fetchMessages,
    sendMessage
  };
};
