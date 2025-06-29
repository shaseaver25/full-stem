
import { supabase } from "@/integrations/supabase/client";

export interface ClassMessage {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  content: string;
  message_type: 'announcement' | 'general' | 'urgent';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  sent_at: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  class_id?: string;
  subject?: string;
  content: string;
  is_read: boolean;
  parent_message_id?: string;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateClassMessageData {
  classId: string;
  title: string;
  content: string;
  messageType?: 'announcement' | 'general' | 'urgent';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
  isPinned?: boolean;
}

export interface CreateDirectMessageData {
  recipientId: string;
  classId?: string;
  subject?: string;
  content: string;
  parentMessageId?: string;
  attachmentUrls?: string[];
}

export const createClassMessage = async (data: CreateClassMessageData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!teacherProfile) throw new Error('Teacher profile not found');

    const { data: result, error } = await supabase
      .from('class_messages')
      .insert({
        class_id: data.classId,
        teacher_id: teacherProfile.id,
        title: data.title,
        content: data.content,
        message_type: data.messageType || 'general',
        priority: data.priority || 'normal',
        scheduled_at: data.scheduledAt,
        is_pinned: data.isPinned || false,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating class message:', error);
    return { success: false, error };
  }
};

export const getClassMessages = async (classId: string) => {
  try {
    const { data, error } = await supabase
      .from('class_messages')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type cast the data to ensure proper typing
    const typedData = (data || []).map(message => ({
      ...message,
      message_type: message.message_type as 'announcement' | 'general' | 'urgent',
      priority: message.priority as 'low' | 'normal' | 'high' | 'urgent'
    })) as ClassMessage[];

    return { success: true, data: typedData };
  } catch (error) {
    console.error('Error fetching class messages:', error);
    return { success: false, error };
  }
};

export const createDirectMessage = async (data: CreateDirectMessageData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: result, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: user.id,
        recipient_id: data.recipientId,
        class_id: data.classId,
        subject: data.subject,
        content: data.content,
        parent_message_id: data.parentMessageId,
        attachment_urls: data.attachmentUrls,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating direct message:', error);
    return { success: false, error };
  }
};

export const getDirectMessages = async (recipientId?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

    if (recipientId) {
      // Fix the query chaining - use separate filters instead of 'and'
      query = supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    return { success: false, error };
  }
};

export const markMessageAsRead = async (messageId: string) => {
  try {
    const { error } = await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return { success: false, error };
  }
};
