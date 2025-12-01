import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, Users, ClipboardList, MessageSquare, Calendar, Clock, PlusCircle, GraduationCap, Trash2, Share2, UserPlus } from 'lucide-react';
import { useClass, useClassAssignments } from '@/hooks/useClassManagement';
import { useClassLessons } from '@/hooks/useClassLessons';
import { RosterManagement } from '@/components/teacher/RosterManagement';
import { AssignmentWizard } from '@/components/teacher/AssignmentWizard';
import { ShareClassModal } from '@/components/teacher/ShareClassModal';
import { AssignTeacherDialog } from '@/components/teacher/AssignTeacherDialog';
import { CreateAssessmentButton } from '@/components/ClassAssessments/CreateAssessmentButton';
import { format, startOfToday } from 'date-fns';
import Header from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { removeDuplicateLessons } from '@/utils/removeDuplicateLessons';
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

export default function ClassDetailPage() {
  const { classId, id } = useParams<{ classId?: string; id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignmentWizardOpen, setAssignmentWizardOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);

  // Support both :classId and :id params for flexibility
  const resolvedClassId = classId || id;

  if (!resolvedClassId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold">Class Not Found</h2>
          <p className="text-muted-foreground">The class you're looking for doesn't exist.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/teacher/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { data: classData, isLoading: classLoading } = useClass(resolvedClassId);
  const { data: assignments = [], isLoading: assignmentsLoading } = useClassAssignments(resolvedClassId);
  const { data: lessons = [], isLoading: lessonsLoading } = useClassLessons(resolvedClassId);

  // Remove duplicate lessons mutation
  const { mutate: removeDuplicates } = useMutation({
    mutationFn: () => removeDuplicateLessons(resolvedClassId),
    onSuccess: (result) => {
      if (result.deleted > 0) {
        queryClient.invalidateQueries({ queryKey: ['class-lessons', resolvedClassId] });
        toast({
          title: 'Duplicates Removed',
          description: `Removed ${result.deleted} duplicate lesson${result.deleted > 1 ? 's' : ''}`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to remove duplicates:', error);
    }
  });

  // Fetch teacher info for the class
  const { data: teacherInfo } = useQuery({
    queryKey: ['class-teacher', resolvedClassId],
    queryFn: async () => {
      if (!classData?.teacher_id) return null;
      
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select(`
          id,
          user_id
        `)
        .eq('id', classData.teacher_id)
        .single();
      
      if (error) throw error;
      
      // Get profile info
      if (data?.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', data.user_id)
          .single();
        
        if (!profileError && profileData) {
          return {
            ...data,
            profile: profileData
          };
        }
      }
      
      return data;
    },
    enabled: !!classData?.teacher_id
  });

  // Mutation to delete a lesson
  const deleteLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-lessons', resolvedClassId] });
      toast({
        title: 'Lesson deleted',
        description: 'The lesson has been successfully deleted.',
      });
      setLessonToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete lesson. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting lesson:', error);
    },
  });

  // Mutation to toggle publish status
  const togglePublish = useMutation({
    mutationFn: async (published: boolean) => {
      const { error } = await supabase
        .from('classes')
        .update({ published })
        .eq('id', resolvedClassId);
      
      if (error) throw error;
    },
    onSuccess: (_, published) => {
      queryClient.invalidateQueries({ queryKey: ['class', resolvedClassId] });
      toast({
        title: published ? 'Class Published' : 'Class Unpublished',
        description: published 
          ? 'Class is now visible to students' 
          : 'Class is now hidden from students',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update class status. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating class status:', error);
    },
  });

  // Fetch student count
  const { data: studentCount = 0 } = useQuery({
    queryKey: ['class-student-count', resolvedClassId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('class_students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', resolvedClassId)
        .eq('status', 'active');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!resolvedClassId,
  });

  // Fetch recent submissions count (today)
  const { data: recentSubmissions = 0 } = useQuery({
    queryKey: ['recent-submissions', resolvedClassId],
    queryFn: async () => {
      const today = startOfToday().toISOString();
      
      const { count, error } = await supabase
        .from('assignment_submissions')
        .select('*, assignment:class_assignments_new!inner(class_id)', { count: 'exact', head: true })
        .eq('assignment.class_id', resolvedClassId)
        .gte('submitted_at', today);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!resolvedClassId,
  });

  // Fetch submission counts for all assignments
  const { data: submissionCounts = {} } = useQuery({
    queryKey: ['assignment-submission-counts', resolvedClassId],
    queryFn: async () => {
      // Get all assignments for this class
      const { data: assignmentIds, error: assignmentError } = await supabase
        .from('class_assignments_new')
        .select('id')
        .eq('class_id', resolvedClassId);
      
      if (assignmentError) throw assignmentError;
      
      // Get submission counts for each assignment
      const counts: Record<string, { submitted: number; total: number }> = {};
      
      for (const assignment of assignmentIds || []) {
        const { count: submittedCount, error: submissionError } = await supabase
          .from('assignment_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('assignment_id', assignment.id)
          .eq('status', 'submitted');
        
        if (submissionError) throw submissionError;
        
        counts[assignment.id] = {
          submitted: submittedCount || 0,
          total: studentCount
        };
      }
      
      return counts;
    },
    enabled: !!resolvedClassId && studentCount !== undefined,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (classLoading) {
    return <div>Loading...</div>;
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold">Class Not Found</h2>
          <p className="text-muted-foreground">Unable to load class details.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/teacher/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
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
            <Badge variant={classData.published ? "default" : "secondary"}>
              {classData.published ? "Published" : "Draft"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {format(new Date(classData.created_at), 'PPP')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={classData.published ? "outline" : "default"}
            onClick={() => togglePublish.mutate(!classData.published)}
            disabled={togglePublish.isPending}
          >
            {classData.published ? "Hide from Students" : "Make Visible to Students"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Class
          </Button>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Lessons
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentCount}</div>
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
                <div className="text-2xl font-bold">{recentSubmissions}</div>
                <p className="text-xs text-muted-foreground">submissions today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Teacher</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium truncate">
                    {(teacherInfo as any)?.profile?.full_name || (teacherInfo as any)?.profile?.email || 'Not assigned'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsAssignTeacherOpen(true)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Co-Teacher
                  </Button>
                </div>
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
              <Button onClick={() => navigate(`/teacher/lesson-builder?classId=${resolvedClassId}`)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Build a Lesson
              </Button>
              <Button onClick={() => setAssignmentWizardOpen(true)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Assign Lesson
              </Button>
              <CreateAssessmentButton 
                classId={resolvedClassId}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['class-assessments', resolvedClassId] })}
              />
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

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Lessons & Assessments</h2>
              <p className="text-muted-foreground">
                View and manage lessons and class-wide assessments
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/teacher/lesson-builder?classId=${resolvedClassId}`)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Lesson
              </Button>
              <CreateAssessmentButton 
                classId={resolvedClassId}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['class-assessments', resolvedClassId] })}
              />
              <Button 
                variant="outline" 
                onClick={() => removeDuplicates()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Duplicates
              </Button>
            </div>
          </div>

          {lessonsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">Loading lessons...</p>
              </div>
            </div>
          ) : lessons.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No lessons yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first lesson for this class.
                </p>
                <Button onClick={() => navigate(`/teacher/lesson-builder?classId=${resolvedClassId}`)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson, index) => (
                <Card key={lesson.id} className="h-full transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="mb-2">
                        Lesson {index + 1}
                      </Badge>
                      {lesson.duration && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lesson.duration} min
                        </div>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">
                      {lesson.title}
                    </CardTitle>
                    {lesson.description && (
                      <CardDescription className="line-clamp-2">
                        {lesson.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {lesson.objectives && lesson.objectives.length > 0 && (
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {lesson.objectives.length} objective{lesson.objectives.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {lesson.materials && lesson.materials.length > 0 && (
                        <div className="flex items-start gap-2">
                          <ClipboardList className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {lesson.materials.length} material{lesson.materials.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">
                          Updated {format(new Date(lesson.updated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setLessonToDelete(lesson.id)}
                        className="w-full flex items-center gap-2"
                        title="Delete this lesson"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                      <Link to={`/class-lesson/${lesson.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Teacher Preview
                        </Button>
                      </Link>
                      <Link to={`/student/lesson/${lesson.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View as Student
                        </Button>
                      </Link>
                      <Link to={`/teacher/lesson-builder?classId=${resolvedClassId}&lessonId=${lesson.id}`}>
                        <Button variant="ghost" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Roster Tab */}
        <TabsContent value="roster">
          <RosterManagement classId={resolvedClassId} maxStudents={classData.max_students} />
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
                          {assignment.due_at && !isNaN(new Date(assignment.due_at).getTime()) && (
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
                          <span>
                            {submissionCounts[assignment.id]?.submitted || 0}/{submissionCounts[assignment.id]?.total || studentCount} submitted
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/teacher/assignments/${assignment.id}`)}
                        >
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
        classId={resolvedClassId}
        open={assignmentWizardOpen}
        onOpenChange={setAssignmentWizardOpen}
      />

      <ShareClassModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        classId={resolvedClassId}
        className={classData.name}
        classCode={classData.class_code}
      />

      <AssignTeacherDialog
        open={isAssignTeacherOpen}
        onOpenChange={setIsAssignTeacherOpen}
        classId={resolvedClassId}
        currentTeacherId={classData.teacher_id}
      />

      <AlertDialog open={!!lessonToDelete} onOpenChange={() => setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone and will remove the lesson from the class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => lessonToDelete && deleteLesson.mutate(lessonToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}