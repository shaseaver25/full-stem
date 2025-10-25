import { Link } from 'react-router-dom';
import { useStudentAssignmentsList } from '@/hooks/useStudentAssignmentsList';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'No due date';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isDueSoon = (dueDate?: string) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);
  return due > now && due <= threeDaysFromNow;
};

const isPastDue = (dueDate?: string) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export default function AssignmentsListPage() {
  const { data: assignments, isLoading, error } = useStudentAssignmentsList();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <h1 className="text-3xl font-semibold mb-6">My Assignments</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <h1 className="text-3xl font-semibold mb-6">My Assignments</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load assignments. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/student" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2">My Assignments</h1>
          <p className="text-muted-foreground">
            View and submit assignments from all your classes
          </p>
        </div>

        {!assignments || assignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No assignments available yet</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for new assignments from your classes
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const dueSoon = isDueSoon(assignment.due_at);
              const pastDue = isPastDue(assignment.due_at);
              const isSubmitted = assignment.submission_status === 'submitted';

              return (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{assignment.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{assignment.class_name}</span>
                          <span>•</span>
                          <span>Due {formatDate(assignment.due_at)}</span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {isSubmitted && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Submitted
                          </Badge>
                        )}
                        {!isSubmitted && dueSoon && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due Soon
                          </Badge>
                        )}
                        {!isSubmitted && pastDue && (
                          <Badge variant="destructive">Past Due</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {assignment.description && (
                    <CardContent>
                      <p className="line-clamp-2 text-muted-foreground">
                        {assignment.description}
                      </p>
                    </CardContent>
                  )}
                  <CardFooter>
                    <Link to={`/assignments/${assignment.id}`} className="w-full">
                      <Button size="sm" className="w-full sm:w-auto">
                        {isSubmitted ? 'View Submission' : 'View & Submit'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
