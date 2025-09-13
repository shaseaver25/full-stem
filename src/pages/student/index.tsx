import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/common/StatusChip";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { Calendar, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { data: assignments, isLoading } = useStudentAssignments();

  const formatDueDate = (dueAt: string | null) => {
    if (!dueAt) return null;
    const date = new Date(dueAt);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays > 0) return `Due in ${diffDays} days`;
    return "Overdue";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const openAssignments = assignments?.filter(a => 
    a.assignment_status === 'open' && 
    (a.status === 'assigned' || a.status === 'draft' || a.status === 'returned')
  ) || [];

  const submittedAssignments = assignments?.filter(a => 
    a.status === 'submitted' || a.status === 'graded'
  ) || [];

  const upcomingAssignments = assignments?.filter(a => 
    a.assignment_status === 'not_released'
  ) || [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Assignments</h1>
          <p className="text-muted-foreground mt-2">
            Track your assignments and submit your work
          </p>
        </div>
      </div>

      {/* Open Assignments */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Open Assignments</h2>
          <span className="text-sm text-muted-foreground">({openAssignments.length})</span>
        </div>
        
        {openAssignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No open assignments at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {openAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {assignment.class_name}
                      </CardDescription>
                    </div>
                    <StatusChip status={assignment.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDueDate(assignment.due_at)}</span>
                      </div>
                      {assignment.submitted_at && (
                        <div>
                          Submitted: {new Date(assignment.submitted_at).toLocaleDateString()}
                        </div>
                      )}
                      {assignment.return_reason && (
                        <div className="text-orange-600">
                          Returned: {assignment.return_reason}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/student/assignments/${assignment.assignment_id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link to={`/student/assignments/${assignment.assignment_id}/submit`}>
                          {assignment.status === 'assigned' ? 'Start' : 'Continue'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Submitted Assignments */}
      {submittedAssignments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <h2 className="text-2xl font-semibold">Submitted Assignments</h2>
            <span className="text-sm text-muted-foreground">({submittedAssignments.length})</span>
          </div>
          
          <div className="grid gap-4">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.class_name}</CardDescription>
                    </div>
                    <StatusChip status={assignment.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Submitted: {assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleDateString() : 'Unknown'}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/student/assignments/${assignment.assignment_id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Assignments */}
      {upcomingAssignments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-semibold">Upcoming Assignments</h2>
            <span className="text-sm text-muted-foreground">({upcomingAssignments.length})</span>
          </div>
          
          <div className="grid gap-4">
            {upcomingAssignments.map((assignment) => (
              <Card key={assignment.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.class_name}</CardDescription>
                    </div>
                    <StatusChip status={assignment.assignment_status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {assignment.release_at && (
                      <>Available: {new Date(assignment.release_at).toLocaleDateString()}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}