import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { useStudentJoinRequests, useCancelJoinRequest } from '@/hooks/useJoinRequests';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function PendingRequestsList() {
  const { data: requests, isLoading } = useStudentJoinRequests();
  const { mutate: cancelRequest } = useCancelJoinRequest();

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];

  if (isLoading) {
    return <LoadingSpinner text="Loading your requests..." />;
  }

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Join Requests
        </CardTitle>
        <CardDescription>
          Waiting for teacher approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium">{request.classes?.name}</h4>
              <p className="text-sm text-muted-foreground">
                Requested {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
              </p>
              {request.message && (
                <p className="text-sm text-muted-foreground italic mt-1">
                  Your message: "{request.message}"
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Pending</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelRequest(request.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
