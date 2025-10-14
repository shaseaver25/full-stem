import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MessageSquare, 
  Pin, 
  Lock, 
  MoreVertical, 
  Trash2,
  Unlock,
  PinOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DiscussionThread } from '@/hooks/useDiscussionThreads';
import { ThreadReplies } from './ThreadReplies';
import SafeHtml from '@/components/ui/SafeHtml';
import { ReactionPicker } from './ReactionPicker';

interface ThreadCardProps {
  thread: DiscussionThread;
  isTeacher: boolean;
  onTogglePin: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
}

export const ThreadCard = ({
  thread,
  isTeacher,
  onTogglePin,
  onToggleLock,
  onDelete
}: ThreadCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const initials = thread.creator?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{thread.title}</h3>
                {thread.is_pinned && (
                  <Badge variant="secondary" className="gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
                {thread.is_locked && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{thread.creator?.full_name || 'Unknown'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {isTeacher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onTogglePin}>
                  {thread.is_pinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin Thread
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin Thread
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleLock}>
                  {thread.is_locked ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock Thread
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock Thread
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Thread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Body */}
        <div className="mb-4">
          <SafeHtml html={thread.body} className="text-sm" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {thread.reply_count || 0} {thread.reply_count === 1 ? 'reply' : 'replies'}
            </Button>

            <ReactionPicker
              reactions={thread.reactions || []}
              onToggle={(emoji) => console.log('Toggle reaction:', emoji)}
              threadId={thread.id}
            />
          </div>
        </div>
      </div>

      {/* Replies Section */}
      {expanded && (
        <div className="border-t bg-muted/30">
          <ThreadReplies
            threadId={thread.id}
            isLocked={thread.is_locked}
            isTeacher={isTeacher}
          />
        </div>
      )}
    </Card>
  );
};