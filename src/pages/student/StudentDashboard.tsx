import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentClasses } from '@/hooks/useStudentClasses';
import { useStudentAssignments } from '@/hooks/useStudentAssignments';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: classes = [], isLoading: classesLoading } = useStudentClasses();
  const { data: assignments = [], isLoading: assignmentsLoading } = useStudentAssignments();
  const { data: grades = [], isLoading: gradesLoading } = useStudentGrades();

  // Calculate stats
  const upcomingAssignments = assignments.filter(a => 
    a.due_at && isFuture(new Date(a.due_at)) && a.status !== 'submitted'
  ).length;

  const overdueAssignments = assignments.filter(a => 
    a.due_at && isPast(new Date(a.due_at)) && a.status !== 'submitted'
  ).length;

  const completedAssignments = assignments.filter(a => 
    a.status === 'submitted'
  ).length;

  // Calculate average grade
  const gradedAssignments = grades.filter(g => g.grade !== undefined && g.grade !== null);
  const averageGrade = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((sum, g) => sum + (g.grade || 0), 0) / gradedAssignments.length)
    : null;

  // Get recent assignments (next 5 upcoming)
  const recentAssignments = [...assignments]
    .filter(a => a.due_at && isFuture(new Date(a.due_at)))
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user?.user_metadata?.full_name || 'Student'}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your classes</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Assignments due soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Total submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageGrade !== null ? `${averageGrade}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts for overdue */}
        {overdueAssignments > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Overdue Assignments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You have {overdueAssignments} overdue assignment{overdueAssignments !== 1 ? 's' : ''}.
              </p>
              <Button asChild variant="destructive">
                <Link to="/assignments">View Assignments</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Classes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Classes</CardTitle>
                  <CardDescription>Currently enrolled courses</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/classes/my-classes">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <p className="text-sm text-muted-foreground">Loading classes...</p>
              ) : classes.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No classes enrolled yet</p>
                  <Button asChild size="sm">
                    <Link to="/classes/join">Join a Class</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.slice(0, 3).map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      to={`/classes/${enrollment.class_id}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{enrollment.classes.name}</h4>
                          {enrollment.classes.subject && (
                            <Badge variant="outline" className="mt-1">
                              {enrollment.classes.subject}
                            </Badge>
                          )}
                        </div>
                        {enrollment.teacher && (
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {enrollment.teacher.first_name} {enrollment.teacher.last_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Assignments</CardTitle>
                  <CardDescription>Due soon</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/assignments">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <p className="text-sm text-muted-foreground">Loading assignments...</p>
              ) : recentAssignments.length === 0 ? (
                <div className="text-center py-6">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming assignments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAssignments.map((assignment) => (
                    <Link
                      key={assignment.id}
                      to={`/assignments/${assignment.id}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{assignment.title}</h4>
                          <Badge variant={assignment.status === 'submitted' ? 'secondary' : 'default'}>
                            {assignment.status || 'pending'}
                          </Badge>
                        </div>
                        {assignment.due_at && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Due {format(new Date(assignment.due_at), 'MMM d, h:mm a')}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to common sections</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/classes/my-classes">
                <BookOpen className="h-4 w-4 mr-2" />
                My Classes
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/assignments">
                <ClipboardList className="h-4 w-4 mr-2" />
                Assignments
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/grades">
                <GraduationCap className="h-4 w-4 mr-2" />
                My Grades
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/classes/join">
                <Calendar className="h-4 w-4 mr-2" />
                Join Class
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
