import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DiscussionThread {
  id: string;
  class_id: string | null;
  lesson_id: string | null;
  assignment_id: string | null;
  created_by: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  creator?: {
    full_name: string;
    email: string;
  };
  reply_count?: number;
  reactions?: Array<{ emoji: string; count: number; user_ids: string[] }>;
}

export const useDiscussionThreads = (classId?: string, lessonId?: string, assignmentId?: string) => {
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchThreads();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('discussion-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_threads',
          filter: classId ? `class_id=eq.${classId}` : undefined
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchThreads();
          } else if (payload.eventType === 'UPDATE') {
            setThreads(prev => prev.map(t => 
              t.id === payload.new.id ? { ...t, ...payload.new } : t
            ));
          } else if (payload.eventType === 'DELETE') {
            setThreads(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, lessonId, assignmentId]);

  const fetchThreads = async () => {
    try {
      let query = supabase
        .from('discussion_threads')
        .select(`
          *
        `)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });

      if (classId) query = query.eq('class_id', classId);
      if (lessonId) query = query.eq('lesson_id', lessonId);
      if (assignmentId) query = query.eq('assignment_id', assignmentId);

      const { data, error } = await query;

      if (error) throw error;

      // Fetch reply counts, reactions, and creator info for each thread
      const threadsWithMeta = await Promise.all(
        (data || []).map(async (thread) => {
          const [repliesRes, reactionsRes, creatorRes] = await Promise.all([
            supabase
              .from('discussion_replies')
              .select('id', { count: 'exact', head: true })
              .eq('thread_id', thread.id),
            supabase
              .from('discussion_reactions')
              .select('emoji, user_id')
              .eq('thread_id', thread.id),
            supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', thread.created_by)
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
            ...thread,
            creator: creatorRes.data || undefined,
            reply_count: repliesRes.count || 0,
            reactions: Array.from(reactionMap.entries()).map(([emoji, data]) => ({
              emoji,
              ...data
            }))
          };
        })
      );

      setThreads(threadsWithMeta);
    } catch (error: any) {
      console.error('Error fetching threads:', error);
      toast({
        title: 'Error loading discussions',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createThread = async (data: {
    title: string;
    body: string;
    class_id?: string;
    lesson_id?: string;
    assignment_id?: string;
    attachments?: File[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: thread, error } = await supabase
        .from('discussion_threads')
        .insert({
          title: data.title,
          body: data.body,
          class_id: data.class_id,
          lesson_id: data.lesson_id,
          assignment_id: data.assignment_id,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Upload attachments if any
      if (data.attachments && data.attachments.length > 0) {
        await uploadAttachments(thread.id, null, data.attachments);
      }

      toast({
        title: 'Discussion created',
        description: 'Your thread has been posted successfully'
      });

      return thread;
    } catch (error: any) {
      console.error('Error creating thread:', error);
      toast({
        title: 'Error creating discussion',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const uploadAttachments = async (threadId: string, replyId: string | null, files: File[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `discussions/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignment-files')
        .getPublicUrl(filePath);

      // Save attachment record
      await supabase.from('discussion_attachments').insert({
        thread_id: threadId,
        reply_id: replyId,
        uploaded_by: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size
      });
    }
  };

  const togglePin = async (threadId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('discussion_threads')
        .update({ is_pinned: !isPinned })
        .eq('id', threadId);

      if (error) throw error;

      toast({
        title: isPinned ? 'Thread unpinned' : 'Thread pinned',
        description: isPinned ? 'Thread unpinned from top' : 'Thread pinned to top'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleLock = async (threadId: string, isLocked: boolean) => {
    try {
      const { error } = await supabase
        .from('discussion_threads')
        .update({ is_locked: !isLocked })
        .eq('id', threadId);

      if (error) throw error;

      toast({
        title: isLocked ? 'Thread unlocked' : 'Thread locked',
        description: isLocked ? 'Users can now reply' : 'Thread locked for replies'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteThread = async (threadId: string) => {
    try {
      const { error } = await supabase
        .from('discussion_threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;

      toast({
        title: 'Thread deleted',
        description: 'Discussion has been removed'
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting thread',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return {
    threads,
    loading,
    createThread,
    togglePin,
    toggleLock,
    deleteThread,
    refetch: fetchThreads
  };
};