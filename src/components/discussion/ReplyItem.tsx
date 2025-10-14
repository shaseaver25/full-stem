import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Trash2, FileIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DiscussionReply } from '@/hooks/useDiscussionReplies';
import SafeHtml from '@/components/ui/SafeHtml';
import { ReactionPicker } from './ReactionPicker';
import { ReplyComposer } from './ReplyComposer';
import { useAuth } from '@/contexts/AuthContext';

interface ReplyItemProps {
  reply: DiscussionReply;
  threadId: string;
  isTeacher: boolean;
  onReply: (content: string, files?: File[]) => Promise<void>;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  isNested?: boolean;
}

export const ReplyItem = ({
  reply,
  threadId,
  isTeacher,
  onReply,
  onReact,
  onDelete,
  isNested = false
}: ReplyItemProps) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const { user } = useAuth();

  const initials = reply.author?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const canDelete = isTeacher || reply.user_id === user?.id;

  return (
    <div className={isNested ? 'ml-12' : ''}>
      <Card className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{reply.author?.full_name || 'Unknown'}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </span>
              {reply.user_id === user?.id && (
                <Badge variant="secondary" className="text-xs">You</Badge>
              )}
            </div>

            {reply.is_deleted ? (
              <p className="text-sm text-muted-foreground italic">[deleted]</p>
            ) : (
              <>
                <SafeHtml html={reply.content} className="text-sm mb-2" />

                {/* Attachments */}
                {reply.attachments && reply.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {reply.attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors text-sm"
                      >
                        <FileIcon className="h-4 w-4" />
                        {att.file_name}
                      </a>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2">
                  {!isNested && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyComposer(!showReplyComposer)}
                      className="h-7 text-xs"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}

                  <ReactionPicker
                    reactions={reply.reactions || []}
                    onToggle={onReact}
                    size="sm"
                  />

                  {canDelete && !reply.is_deleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDelete}
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reply Composer */}
        {showReplyComposer && !reply.is_deleted && (
          <div className="ml-11 mt-3 pt-3 border-t">
            <ReplyComposer
              onSubmit={async (content, files) => {
                await onReply(content, files);
                setShowReplyComposer(false);
              }}
              onTyping={() => {}}
              placeholder="Write a reply..."
              compact
            />
          </div>
        )}
      </Card>

      {/* Nested Replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {reply.replies.map(nestedReply => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              threadId={threadId}
              isTeacher={isTeacher}
              onReply={onReply}
              onReact={(emoji) => onReact(emoji)}
              onDelete={() => onDelete()}
              isNested
            />
          ))}
        </div>
      )}
    </div>
  );
};