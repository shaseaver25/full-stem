import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, Users, ClipboardList, MessageSquare, Calendar, Clock, PlusCircle } from 'lucide-react';
import { useClass, useClassAssignments } from '@/hooks/useClassManagement';
import { RosterManagement } from '@/components/teacher/RosterManagement';
import { AssignmentWizard } from '@/components/teacher/AssignmentWizard';
import { format } from 'date-fns';
import Header from '@/components/Header';

export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [assignmentWizardOpen, setAssignmentWizardOpen] = useState(false);

  if (!classId) {
    return <div>Class not found</div>;
  }

  const { data: classData, isLoading: classLoading } = useClass(classId);
  const { data: assignments = [], isLoading: assignmentsLoading } = useClassAssignments(classId);

  if (classLoading) {
    return <div>Loading...</div>;
  }

  if (!classData) {
    return <div>Class not found</div>;
  }

  const getAssignmentStatus = (assignment: any) => {
    const now = new Date();
    const releaseDate = assignment.release_at ? new Date(assignment.release_at) : null;
    const dueDate = assignment.due_at ? new Date(assignment.due_at) : null;

    if (releaseDate && releaseDate > now) {
      return { status: 'Not Released', variant: 'secondary' as const };
    }
    if (dueDate && dueDate < now) {
      return { status: 'Closed', variant: 'destructive' as const };
    }
    return { status: 'Open', variant: 'default' as const };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/teacher/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            {classData.subject && (
              <Badge variant="outline">{classData.subject}</Badge>
            )}
            {classData.grade_level && (
              <Badge variant="outline">{classData.grade_level}</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Created {format(new Date(classData.created_at), 'PPP')}
            </span>
          </div>
        </div>
      </div>

      {/* Class Overview Card */}
      {classData.description && (
        <Card>
          <CardHeader>
            <CardTitle>Class Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{classData.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="roster" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Roster
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  {classData.max_students ? `of ${classData.max_students} max` : 'No limit set'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assignments.filter(a => getAssignmentStatus(a).status === 'Open').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {assignments.length} total assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">submissions today</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for managing your class
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => navigate(`/teacher/lesson-builder?classId=${classId}`)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Build a Lesson
              </Button>
              <Button onClick={() => setAssignmentWizardOpen(true)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Assign Lesson
              </Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline">
                <ClipboardList className="h-4 w-4 mr-2" />
                View Gradebook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roster Tab */}
        <TabsContent value="roster">
          <RosterManagement classId={classId} maxStudents={classData.max_students} />
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Assignments</h2>
              <p className="text-muted-foreground">
                Manage lesson assignments for this class
              </p>
            </div>
            <Button onClick={() => setAssignmentWizardOpen(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Assign Lesson
            </Button>
          </div>

          {assignmentsLoading ? (
            <div>Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by assigning lesson components to your students.
                </p>
                <Button onClick={() => setAssignmentWizardOpen(true)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Assign First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const statusInfo = getAssignmentStatus(assignment);
                return (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {assignment.title}
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.status}
                            </Badge>
                          </CardTitle>
                          {assignment.description && (
                            <CardDescription className="mt-1">
                              {assignment.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {format(new Date(assignment.created_at), 'MMM d')}
                          </div>
                          {assignment.due_at && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              Due {format(new Date(assignment.due_at), 'MMM d, h:mm a')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{assignment.selected_components.length} components</span>
                          <span>•</span>
                          <span>{assignment.options.points || 100} points</span>
                          <span>•</span>
                          <span>0/0 submitted</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Class Messages</h3>
              <p className="text-muted-foreground">
                Messaging features coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssignmentWizard
        classId={classId}
        open={assignmentWizardOpen}
        onOpenChange={setAssignmentWizardOpen}
      />
      </div>
    </div>
  );
}