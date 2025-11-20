import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, MessageSquare } from 'lucide-react';
import { JoinRequest } from '@/hooks/useJoinRequests';
import { useApproveJoinRequest, useRejectJoinRequest } from '@/hooks/useJoinRequests';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface JoinRequestCardProps {
  request: JoinRequest;
}

export function JoinRequestCard({ request }: JoinRequestCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { mutate: approve, isPending: isApproving } = useApproveJoinRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectJoinRequest();

  const handleApprove = () => {
    approve(request.id);
  };

  const handleReject = () => {
    reject(
      { requestId: request.id, reason: rejectionReason.trim() || undefined },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectionReason('');
        },
      }
    );
  };

  const studentName = request.student
    ? `${request.student.first_name} ${request.student.last_name}`
    : 'Unknown Student';

  const studentInitials = request.student
    ? `${request.student.first_name[0]}${request.student.last_name[0]}`
    : '?';

  const studentEmail = request.student?.email || 'No email';

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{studentInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{studentName}</h4>
                <p className="text-sm text-muted-foreground">{studentEmail}</p>
              </div>
            </div>
            <Badge variant="secondary">
              {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
            </Badge>
          </div>
        </CardHeader>

        {request.message && (
          <CardContent className="pb-3">
            <div className="flex gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground italic">
                "{request.message}"
              </p>
            </div>
          </CardContent>
        )}

        <CardFooter className="gap-2">
          <Button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRejectDialog(true)}
            disabled={isApproving || isRejecting}
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Join Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {studentName}'s request to join this class?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid gap-2 py-4">
            <Label htmlFor="reason">
              Reason for rejection <span className="text-muted-foreground font-normal">(optional, will be shared with student)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why you're rejecting this request..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              {rejectionReason.length}/300 characters
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={isRejecting}>
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
