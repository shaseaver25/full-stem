import { useState, useEffect } from 'react';
import { useDiscussionReplies } from '@/hooks/useDiscussionReplies';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ReplyItem } from './ReplyItem';
import { ReplyComposer } from './ReplyComposer';

interface ThreadRepliesProps {
  threadId: string;
  isLocked: boolean;
  isTeacher: boolean;
}

export const ThreadReplies = ({ threadId, isLocked, isTeacher }: ThreadRepliesProps) => {
  const { 
    replies, 
    loading, 
    typingUsers, 
    createReply, 
    toggleReaction, 
    deleteReply,
    setTyping 
  } = useDiscussionReplies(threadId);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Replies List */}
      {replies.length > 0 && (
        <div className="space-y-4">
          {replies.map(reply => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              threadId={threadId}
              isTeacher={isTeacher}
              onReply={async (content, files) => {
                await createReply(content, reply.id, files);
              }}
              onReact={(emoji) => toggleReaction(reply.id, emoji)}
              onDelete={() => deleteReply(reply.id)}
            />
          ))}
        </div>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="text-sm text-muted-foreground italic">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Reply Composer */}
      {!isLocked && (
        <ReplyComposer
          onSubmit={async (content, files) => {
            await createReply(content, null, files);
          }}
          onTyping={setTyping}
          placeholder="Write a reply..."
        />
      )}

      {isLocked && (
        <div className="text-center py-8 text-muted-foreground">
          This thread is locked. No new replies can be added.
        </div>
      )}
    </div>
  );
};