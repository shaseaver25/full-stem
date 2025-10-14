import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '🤔', '👏', '🔥', '💯'];

interface ReactionPickerProps {
  reactions: Array<{ emoji: string; count: number; user_ids: string[] }>;
  onToggle: (emoji: string) => void;
  threadId?: string;
  size?: 'sm' | 'default';
}

export const ReactionPicker = ({
  reactions,
  onToggle,
  size = 'default'
}: ReactionPickerProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const handleReactionClick = (emoji: string) => {
    onToggle(emoji);
    setOpen(false);
  };

  const hasUserReacted = (reaction: { user_ids: string[] }) => {
    return user && reaction.user_ids.includes(user.id);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Existing Reactions */}
      {reactions.map(reaction => (
        <Button
          key={reaction.emoji}
          variant={hasUserReacted(reaction) ? 'secondary' : 'ghost'}
          size={size}
          onClick={() => onToggle(reaction.emoji)}
          className={cn(
            'gap-1',
            size === 'sm' ? 'h-7 text-xs px-2' : 'h-8 px-3'
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </Button>
      ))}

      {/* Add Reaction */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className={size === 'sm' ? 'h-7 w-7 p-0' : 'h-8 w-8 p-0'}
          >
            <Smile className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className="p-2 hover:bg-muted rounded-md transition-colors text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
