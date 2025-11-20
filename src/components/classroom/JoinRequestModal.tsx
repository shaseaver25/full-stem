import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useRequestToJoinClass } from '@/hooks/useJoinRequests';

interface JoinRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinRequestModal({ open, onOpenChange }: JoinRequestModalProps) {
  const [classCode, setClassCode] = useState('');
  const [message, setMessage] = useState('');
  const { mutate: requestToJoin, isPending } = useRequestToJoinClass();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestToJoin(
      { classCode: classCode.trim(), message: message.trim() || undefined },
      {
        onSuccess: (result) => {
          if (result.success) {
            setClassCode('');
            setMessage('');
            onOpenChange(false);
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request to Join Class</DialogTitle>
            <DialogDescription>
              Enter the class code and send a request to your teacher. They'll review and approve your request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="class-code">Class Code</Label>
              <Input
                id="class-code"
                placeholder="Enter 8-character code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                maxLength={8}
                disabled={isPending}
                required
              />
              <p className="text-sm text-muted-foreground">
                Get this code from your teacher
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">
                Message to Teacher <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Why do you want to join this class?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                disabled={isPending}
              />
              <p className="text-sm text-muted-foreground">
                {message.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !classCode.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
