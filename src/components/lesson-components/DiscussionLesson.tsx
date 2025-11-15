import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, RefreshCw, Lightbulb, Volume2, Reply, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '@/components/LanguageSelector';

interface DiscussionLessonProps {
  content: any;
  lessonComponentId: string;
  isStudent?: boolean;
}

export function DiscussionLesson({ content, lessonComponentId, isStudent = false }: DiscussionLessonProps) {
  const { user } = useAuth();
  const [newPostContent, setNewPostContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { speak, isPlaying } = useTextToSpeech();
  const { translate } = useTranslation();

  // Get the parent lesson ID from the lesson component
  const { data: lessonData } = useQuery({
    queryKey: ['lesson-from-component', lessonComponentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_components')
        .select('lesson_id')
        .eq('id', lessonComponentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonComponentId,
  });

  // Fetch or create discussion thread for this lesson
  const { data: threadData } = useQuery({
    queryKey: ['discussion-thread', lessonData?.lesson_id],
    queryFn: async () => {
      if (!lessonData?.lesson_id) return null;
      
      // Try to find existing thread for this lesson component
      const { data: existing, error: fetchError } = await supabase
        .from('discussion_threads')
        .select('id')
        .eq('lesson_id', lessonData.lesson_id)
        .eq('title', `Discussion: ${lessonComponentId}`)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      if (existing) return existing;

      // Create thread if it doesn't exist
      const { data: newThread, error: createError } = await supabase
        .from('discussion_threads')
        .insert({
          lesson_id: lessonData.lesson_id,
          title: `Discussion: ${lessonComponentId}`,
          body: 'Discussion for this lesson component',
          created_by: user?.id || '',
        })
        .select('id')
        .single();

      if (createError) throw createError;
      return newThread;
    },
    enabled: !!user && !!lessonData?.lesson_id,
  });

  // Fetch replies with user information
  const { data: postsData, refetch, isLoading } = useQuery({
    queryKey: ['discussion-replies', threadData?.id],
    queryFn: async () => {
      if (!threadData?.id) return [];
      
      const { data: replies, error } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('thread_id', threadData.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for replies
      if (replies && replies.length > 0) {
        const userIds = [...new Set(replies.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        // Attach profiles to replies
        return replies.map(reply => ({
          ...reply,
          profiles: profiles?.find(p => p.id === reply.user_id) || null
        }));
      }

      return replies || [];
    },
    enabled: !!threadData?.id,
  });

  // Organize posts into threads
  const threads = useMemo(() => {
    if (!postsData) return [];
    
    const topLevel = postsData.filter(post => !post.parent_id);
    
    return topLevel.map(parent => ({
      ...parent,
      replies: postsData.filter(post => post.parent_id === parent.id)
    }));
  }, [postsData]);

  // Submit new post
  const handleSubmit = async (parentPostId: string | null = null) => {
    console.log('=== DISCUSSION POST SUBMIT ===');
    console.log('lessonComponentId:', lessonComponentId);
    console.log('lessonData:', lessonData);
    console.log('threadData:', threadData);
    console.log('user:', user?.id);
    console.log('newPostContent:', newPostContent);
    
    if (!newPostContent.trim() || !user || !threadData?.id) {
      console.log('Submit blocked:', { 
        hasContent: !!newPostContent.trim(), 
        hasUser: !!user, 
        hasThread: !!threadData?.id 
      });
      return;
    }

    if (newPostContent.length > (content?.settings?.maxPostLength || 1000)) {
      toast.error(`Post exceeds maximum length of ${content?.settings?.maxPostLength || 1000} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Inserting reply:', {
        thread_id: threadData.id,
        user_id: user.id,
        parent_id: parentPostId,
        content: newPostContent.trim(),
      });
      
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          thread_id: threadData.id,
          user_id: user.id,
          parent_id: parentPostId,
          content: newPostContent.trim(),
        });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Post submitted successfully');
      toast.success('Post submitted successfully');
      setNewPostContent('');
      setReplyingTo(null);
      refetch();
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error('Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReadPrompt = async () => {
    if (content?.prompt) {
      const translatedText = await translate(content.prompt);
      speak(translatedText || content.prompt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Accessibility Controls */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
        <LanguageSelector />
        <Button
          variant="outline"
          size="sm"
          onClick={handleReadPrompt}
          disabled={isPlaying}
        >
          <Volume2 className="h-4 w-4 mr-2" />
          Read Prompt Aloud
        </Button>
      </div>

      {/* Discussion Prompt */}
      <div className="border-l-4 border-primary pl-6 py-2">
        <h3 className="text-xl font-semibold mb-2">
          {content?.prompt || 'Discussion Prompt'}
        </h3>
        {content?.description && (
          <p className="text-muted-foreground">
            {content.description}
          </p>
        )}
      </div>

      {/* Seed Posts (Example Responses) */}
      {content?.seedPosts && content.seedPosts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Lightbulb className="h-5 w-5" />
            <span className="font-medium">Example Responses</span>
          </div>
          {content.seedPosts.map((post: any, index: number) => (
            <div key={index} className="bg-background rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {post.authorName?.charAt(0) || 'E'}
                  </span>
                </div>
                <span className="font-medium text-sm">{post.authorName || 'Example'}</span>
              </div>
              <p className="ml-10 text-sm">{post.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Post Input (if student can post) */}
      {isStudent && !replyingTo && (
        <div className="border rounded-lg p-4 bg-card">
          <Label htmlFor="new-post" className="mb-2 text-base">Your Response</Label>
          <Textarea
            id="new-post"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            maxLength={content?.settings?.maxPostLength || 1000}
            className="mb-3 mt-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {newPostContent.length} / {content?.settings?.maxPostLength || 1000} characters
            </span>
            <Button
              onClick={() => handleSubmit(null)}
              disabled={!newPostContent.trim() || isSubmitting}
            >
              {isSubmitting ? (
                'Posting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Response
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Discussion Threads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">
            Discussion ({threads.length} {threads.length === 1 ? 'response' : 'responses'})
          </h4>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading discussion...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No responses yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          threads.map((thread) => (
            <DiscussionPost
              key={thread.id}
              post={thread}
              replies={thread.replies}
              allowReplies={content?.settings?.allowStudentReplies !== false}
              isStudent={isStudent}
              onReply={(postId) => setReplyingTo(postId)}
              replyingTo={replyingTo}
              onSubmitReply={handleSubmit}
              newPostContent={newPostContent}
              setNewPostContent={setNewPostContent}
              maxLength={content?.settings?.maxPostLength || 1000}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface DiscussionPostProps {
  post: any;
  replies: any[];
  allowReplies: boolean;
  isStudent: boolean;
  onReply: (postId: string) => void;
  replyingTo: string | null;
  onSubmitReply: (parentId: string) => void;
  newPostContent: string;
  setNewPostContent: (content: string) => void;
  maxLength: number;
}

function DiscussionPost({
  post,
  replies,
  allowReplies,
  isStudent,
  onReply,
  replyingTo,
  onSubmitReply,
  newPostContent,
  setNewPostContent,
  maxLength,
}: DiscussionPostProps) {
  const { speak, isPlaying } = useTextToSpeech();
  const { translate } = useTranslation();

  const authorName = post.profiles?.full_name || post.profiles?.email?.split('@')[0] || 'Anonymous';

  const handleReadAloud = async () => {
    const translatedText = await translate(post.content);
    speak(translatedText || post.content);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card hover:shadow-sm transition-shadow">
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{authorName}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Read Aloud Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReadAloud}
          disabled={isPlaying}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="ml-13 text-foreground leading-relaxed">
        {post.content}
      </div>

      {/* Reply Button */}
      {allowReplies && isStudent && (
        <div className="ml-13">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReply(post.id)}
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
        </div>
      )}

      {/* Reply Input */}
      {replyingTo === post.id && (
        <div className="ml-13 mt-3 border rounded-lg p-3 bg-muted/50">
          <Textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Write your reply..."
            rows={3}
            maxLength={maxLength}
            className="mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {newPostContent.length} / {maxLength} characters
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onReply(null as any);
                  setNewPostContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onSubmitReply(post.id)}
                disabled={!newPostContent.trim()}
              >
                Submit Reply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="ml-13 space-y-3 pt-3 border-l-2 border-muted pl-4">
          {replies.map((reply) => (
            <DiscussionPost
              key={reply.id}
              post={reply}
              replies={[]}
              allowReplies={false}
              isStudent={isStudent}
              onReply={onReply}
              replyingTo={replyingTo}
              onSubmitReply={onSubmitReply}
              newPostContent={newPostContent}
              setNewPostContent={setNewPostContent}
              maxLength={maxLength}
            />
          ))}
        </div>
      )}
    </div>
  );
}
