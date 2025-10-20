import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClipboardList, Calendar, Award, AlertCircle, ExternalLink } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { Link } from 'react-router-dom';

interface Assignment {
  id: string;
  status: string;
  assignment?: {
    title: string;
    due_at: string | null;
    max_points: number;
  };
  grades?: Array<{
    grade: number;
    feedback: string | null;
    graded_at: string;
  }>;
}

interface StudentAssignmentsListProps {
  assignments: Assignment[];
  stats: {
    completionRate: string;
    submittedCount: number;
    totalAssignments: number;
  } | null;
}

export function StudentAssignmentsList({ assignments, stats }: StudentAssignmentsListProps) {
  const pendingAssignments = assignments.filter(a => 
    a.status === 'draft' && a.assignment?.due_at && !isPast(new Date(a.assignment.due_at))
  );

  const overdueAssignments = assignments.filter(a =>
    a.status === 'draft' && a.assignment?.due_at && isPast(new Date(a.assignment.due_at))
  );

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.grades && assignment.grades.length > 0) {
      return <Badge variant="default">Graded</Badge>;
    }
    if (assignment.status === 'submitted') {
      return <Badge variant="secondary">Submitted</Badge>;
    }
    if (assignment.assignment?.due_at && isPast(new Date(assignment.assignment.due_at))) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="outline">Not Started</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          My Assignments
        </CardTitle>
        <CardDescription>
          Track your assignments and grades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Summary */}
        {stats && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <Progress value={parseFloat(stats.completionRate)} />
            <p className="text-xs text-muted-foreground">
              {stats.submittedCount} of {stats.totalAssignments} assignments completed
            </p>
          </div>
        )}

        {/* Overdue Alert */}
        {overdueAssignments.length > 0 && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">
                  {overdueAssignments.length} assignment{overdueAssignments.length > 1 ? 's' : ''} overdue
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please complete these as soon as possible
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Assignments List */}
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No assignments yet</p>
            </div>
          ) : (
            assignments.map((assignment) => {
              const isOverdue = assignment.status === 'draft' && 
                assignment.assignment?.due_at && 
                isPast(new Date(assignment.assignment.due_at));

              return (
                <Card key={assignment.id} className={isOverdue ? 'border-destructive' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">
                            {assignment.assignment?.title || 'Untitled Assignment'}
                          </h4>
                          {getStatusBadge(assignment)}
                        </div>

                        {assignment.assignment?.due_at && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {format(new Date(assignment.assignment.due_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}

                        {assignment.grades && assignment.grades.length > 0 && (
                          <div className="flex items-center gap-4 pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-primary" />
                              <span className="text-lg font-bold">
                                {assignment.grades[0].grade}%
                              </span>
                            </div>
                            {assignment.grades[0].feedback && (
                              <p className="text-sm text-muted-foreground">
                                {assignment.grades[0].feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/assignments/${assignment.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}