import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DiscussionReply {
  id: string;
  thread_id: string;
  parent_id: string | null;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  author?: {
    full_name: string;
    email: string;
  };
  reactions?: Array<{ emoji: string; count: number; user_ids: string[] }>;
  attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
  }>;
  replies?: DiscussionReply[];
}

export const useDiscussionReplies = (threadId: string) => {
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!threadId) return;

    fetchReplies();

    // Set up real-time subscriptions
    const repliesChannel = supabase
      .channel(`replies-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_replies',
          filter: `thread_id=eq.${threadId}`
        },
        () => {
          fetchReplies();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_reactions'
        },
        () => {
          fetchReplies();
        }
      )
      .subscribe();

    // Typing indicators subscription
    const typingChannel = supabase
      .channel(`typing-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_typing',
          filter: `thread_id=eq.${threadId}`
        },
        async () => {
          fetchTypingUsers();
        }
      )
      .subscribe();

    // Clean up old typing indicators
    const typingInterval = setInterval(() => {
      cleanOldTypingIndicators();
    }, 10000);

    return () => {
      supabase.removeChannel(repliesChannel);
      supabase.removeChannel(typingChannel);
      clearInterval(typingInterval);
    };
  }, [threadId]);

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch reactions, attachments, and author info for each reply
      const repliesWithMeta = await Promise.all(
        (data || []).map(async (reply) => {
          const [reactionsRes, attachmentsRes, authorRes] = await Promise.all([
            supabase
              .from('discussion_reactions')
              .select('emoji, user_id')
              .eq('reply_id', reply.id),
            supabase
              .from('discussion_attachments')
              .select('id, file_name, file_url, file_type')
              .eq('reply_id', reply.id),
            supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', reply.user_id)
              .single()
          ]);

          const reactionMap = new Map<string, { count: number; user_ids: string[] }>();
          (reactionsRes.data || []).forEach(r => {
            const existing = reactionMap.get(r.emoji) || { count: 0, user_ids: [] };
            reactionMap.set(r.emoji, {
              count: existing.count + 1,
              user_ids: [...existing.user_ids, r.user_id]
            });
          });

          return {
            ...reply,
            author: authorRes.data || undefined,
            reactions: Array.from(reactionMap.entries()).map(([emoji, data]) => ({
              emoji,
              ...data
            })),
            attachments: attachmentsRes.data || []
          };
        })
      );

      // Build nested structure (up to 2 levels)
      const topLevel = repliesWithMeta.filter(r => !r.parent_id);
      const nested = topLevel.map(parent => ({
        ...parent,
        replies: repliesWithMeta.filter(r => r.parent_id === parent.id)
      }));

      setReplies(nested);
    } catch (error: any) {
      console.error('Error fetching replies:', error);
      toast({
        title: 'Error loading replies',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTypingUsers = async () => {
    try {
      const { data } = await supabase
        .from('discussion_typing')
        .select('user_id')
        .eq('thread_id', threadId)
        .gte('updated_at', new Date(Date.now() - 10000).toISOString());

      if (!data || data.length === 0) {
        setTypingUsers([]);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch profile names for typing users
      const userIds = data.filter(t => t.user_id !== user?.id).map(t => t.user_id);
      if (userIds.length === 0) {
        setTypingUsers([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const users = (profiles || []).map(p => p.full_name || 'Someone');
      setTypingUsers(users);
    } catch (error) {
      console.error('Error fetching typing users:', error);
    }
  };

  const cleanOldTypingIndicators = async () => {
    await supabase
      .from('discussion_typing')
      .delete()
      .eq('thread_id', threadId)
      .lt('updated_at', new Date(Date.now() - 10000).toISOString());
  };

  const setTyping = async (isTyping: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isTyping) {
        await supabase
          .from('discussion_typing')
          .upsert({
            thread_id: threadId,
            user_id: user.id,
            updated_at: new Date().toISOString()
          });
      } else {
        await supabase
          .from('discussion_typing')
          .delete()
          .eq('thread_id', threadId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const createReply = async (content: string, parentId: string | null = null, attachments?: File[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: reply, error } = await supabase
        .from('discussion_replies')
        .insert({
          thread_id: threadId,
          parent_id: parentId,
          user_id: user.id,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Upload attachments if any
      if (attachments && attachments.length > 0) {
        await uploadAttachments(reply.id, attachments);
      }

      // Clear typing indicator
      await setTyping(false);

      // Create notification for thread creator and parent reply author
      const { data: thread } = await supabase
        .from('discussion_threads')
        .select('created_by')
        .eq('id', threadId)
        .single();

      if (thread && thread.created_by !== user.id) {
        await supabase.from('notifications').insert({
          user_id: thread.created_by,
          title: 'New reply',
          message: `Someone replied to your discussion`,
          type: 'discussion',
          metadata: { thread_id: threadId, reply_id: reply.id }
        });
      }

      return reply;
    } catch (error: any) {
      console.error('Error creating reply:', error);
      toast({
        title: 'Error posting reply',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const uploadAttachments = async (replyId: string, files: File[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `discussions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assignment-files')
        .getPublicUrl(filePath);

      await supabase.from('discussion_attachments').insert({
        reply_id: replyId,
        uploaded_by: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size
      });
    }
  };

  const toggleReaction = async (replyId: string | null, emoji: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if reaction exists
      const { data: existing } = await supabase
        .from('discussion_reactions')
        .select('id')
        .eq(replyId ? 'reply_id' : 'thread_id', replyId || threadId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from('discussion_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add reaction
        await supabase.from('discussion_reactions').insert({
          [replyId ? 'reply_id' : 'thread_id']: replyId || threadId,
          user_id: user.id,
          emoji
        });
      }
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .update({ is_deleted: true, content: '[deleted]' })
        .eq('id', replyId);

      if (error) throw error;

      toast({
        title: 'Reply deleted',
        description: 'The reply has been removed'
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting reply',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return {
    replies,
    loading,
    typingUsers,
    createReply,
    toggleReaction,
    deleteReply,
    setTyping,
    refetch: fetchReplies
  };
};