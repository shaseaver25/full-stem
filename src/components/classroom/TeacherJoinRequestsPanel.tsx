import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';
import { useTeacherJoinRequests } from '@/hooks/useJoinRequests';
import { JoinRequestCard } from './JoinRequestCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface TeacherJoinRequestsPanelProps {
  classId?: string;
}

export function TeacherJoinRequestsPanel({ classId }: TeacherJoinRequestsPanelProps) {
  const { data: requests, isLoading } = useTeacherJoinRequests(classId);

  if (isLoading) {
    return <LoadingSpinner text="Loading join requests..." />;
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join Requests
          </CardTitle>
          <CardDescription>
            No pending join requests at this time
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Join Requests
            </CardTitle>
            <CardDescription>
              Review and approve students requesting to join {classId ? 'this class' : 'your classes'}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="h-6">
            {requests.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <JoinRequestCard key={request.id} request={request} />
        ))}
      </CardContent>
    </Card>
  );
}
