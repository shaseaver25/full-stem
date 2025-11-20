import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { JoinRequestModal } from '@/components/classroom/JoinRequestModal';
import { PendingRequestsList } from '@/components/classroom/PendingRequestsList';
import { useStudentJoinRequests } from '@/hooks/useJoinRequests';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function JoinClassPage() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { data: requests } = useStudentJoinRequests();

  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;
  const recentApproved = requests?.filter(r => r.status === 'approved').slice(0, 3) || [];
  const recentRejected = requests?.filter(r => r.status === 'rejected').slice(0, 3) || [];

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Join a Class</h1>
        <p className="text-muted-foreground">
          Request to join a class using the code provided by your teacher
        </p>
      </div>

      {/* Main CTA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Request to Join Class
          </CardTitle>
          <CardDescription>
            Enter your teacher's class code to send a join request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowJoinModal(true)} size="lg" className="w-full">
            <UserPlus className="mr-2 h-5 w-5" />
            Request Access to Class
          </Button>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingCount > 0 && <PendingRequestsList />}

      {/* Recent Approved */}
      {recentApproved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recently Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApproved.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
              >
                <div>
                  <h4 className="font-medium">{request.classes?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Approved {request.reviewed_at && formatDistanceToNow(new Date(request.reviewed_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge className="bg-green-600">Approved</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Rejected */}
      {recentRejected.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Declined Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRejected.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-2 p-3 border rounded-lg bg-red-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{request.classes?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Declined {request.reviewed_at && formatDistanceToNow(new Date(request.reviewed_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="destructive">Declined</Badge>
                </div>
                {request.rejection_reason && (
                  <p className="text-sm text-muted-foreground italic">
                    Reason: "{request.rejection_reason}"
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium mb-1">Get the Class Code</h4>
              <p className="text-sm text-muted-foreground">
                Your teacher will provide you with an 8-character class code
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium mb-1">Request to Join</h4>
              <p className="text-sm text-muted-foreground">
                Enter the code and optionally include a message to your teacher
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium mb-1">Wait for Approval</h4>
              <p className="text-sm text-muted-foreground">
                Your teacher will review your request and approve or decline it
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h4 className="font-medium mb-1">Start Learning!</h4>
              <p className="text-sm text-muted-foreground">
                Once approved, you'll have full access to all class materials and assignments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <JoinRequestModal open={showJoinModal} onOpenChange={setShowJoinModal} />
    </div>
  );
}
