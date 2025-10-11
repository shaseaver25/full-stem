import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAiFeedback } from '@/hooks/useAiFeedback';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Send,
  RefreshCw
} from 'lucide-react';

interface Submission {
  id: string;
  submitted_at: string;
  text_response: string;
  ai_feedback: string | null;
  assignment_id: string;
  user_id: string;
  assignment: {
    title: string;
    class_id: string;
  };
  student: {
    first_name: string;
    last_name: string;
    language_preference: string;
  };
  grade_info?: {
    grade: number;
    feedback: string;
    graded_at: string;
  };
}

export default function TeacherFeedbackDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateFeedback } = useAiFeedback();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [grade, setGrade] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      // Get teacher profile to find their classes
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!teacherProfile) {
        toast({
          title: "Error",
          description: "Teacher profile not found",
          variant: "destructive",
        });
        return;
      }

      // Get all submissions for teacher's classes
      const { data: submissionsData, error } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          submitted_at,
          text_response,
          ai_feedback,
          assignment_id,
          user_id
        `)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Get class assignments for teacher's classes
      const { data: classAssignments } = await supabase
        .from('class_assignments_new')
        .select(`
          id,
          lesson_id,
          class_id,
          classes!inner (
            teacher_id,
            title
          )
        `)
        .eq('classes.teacher_id', teacherProfile.id);

      // Get assignment details
      const lessonIds = [...new Set(classAssignments?.map(ca => ca.lesson_id) || [])];
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, lesson_id')
        .in('lesson_id', lessonIds);

      // Get student info
      const studentIds = [...new Set(submissionsData?.map(s => s.user_id) || [])];
      const { data: students } = await supabase
        .from('students')
        .select('user_id, first_name, last_name, language_preference')
        .in('user_id', studentIds);

      // Fetch grades for these submissions
      const submissionIds = submissionsData?.map(s => s.id) || [];
      const { data: gradesData } = await supabase
        .from('assignment_grades')
        .select('submission_id, grade, feedback, graded_at')
        .in('submission_id', submissionIds);

      // Filter submissions that belong to teacher's classes
      const classAssignmentIds = new Set(classAssignments?.map(ca => ca.id) || []);
      const teacherSubmissions = submissionsData?.filter(sub => 
        classAssignmentIds.has(sub.assignment_id)
      ) || [];

      // Merge data
      const formatted = teacherSubmissions.map(sub => {
        const gradeInfo = gradesData?.find(g => g.submission_id === sub.id);
        const classAssignment = classAssignments?.find(ca => ca.id === sub.assignment_id);
        const assignment = assignments?.find(a => a.lesson_id === classAssignment?.lesson_id);
        const student = students?.find(s => s.user_id === sub.user_id);
        
        return {
          id: sub.id,
          submitted_at: sub.submitted_at,
          text_response: sub.text_response || '',
          ai_feedback: sub.ai_feedback,
          assignment_id: sub.assignment_id,
          user_id: sub.user_id,
          assignment: {
            title: assignment?.title || 'Untitled',
            class_id: classAssignment?.class_id || '',
          },
          student: {
            first_name: student?.first_name || '',
            last_name: student?.last_name || '',
            language_preference: student?.language_preference || 'en',
          },
          grade_info: gradeInfo ? {
            grade: Number(gradeInfo.grade),
            feedback: gradeInfo.feedback || '',
            graded_at: gradeInfo.graded_at,
          } : undefined,
        };
      });

      setSubmissions(formatted);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openReviewDrawer = (submission: Submission) => {
    setSelectedSubmission(submission);
    setTeacherFeedback(submission.grade_info?.feedback || submission.ai_feedback || '');
    setGrade(submission.grade_info?.grade?.toString() || '');
    setDrawerOpen(true);
  };

  const handleRegenrateAI = async () => {
    if (!selectedSubmission) return;

    setRegenerating(true);
    const feedback = await generateFeedback(
      selectedSubmission.id,
      selectedSubmission.text_response,
      grade ? Number(grade) : undefined,
      teacherFeedback
    );

    if (feedback) {
      setTeacherFeedback(feedback);
      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === selectedSubmission.id 
          ? { ...s, ai_feedback: feedback }
          : s
      ));
      toast({
        title: "✨ AI Feedback Regenerated",
        description: "Updated feedback is ready for review",
      });
    }
    setRegenerating(false);
  };

  const handleSaveReview = async () => {
    if (!selectedSubmission || !grade) {
      toast({
        title: "Missing Information",
        description: "Please provide a grade",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Check if grade already exists
      const { data: existingGrade } = await supabase
        .from('assignment_grades')
        .select('id')
        .eq('submission_id', selectedSubmission.id)
        .single();

      if (existingGrade) {
        // Update existing grade
        const { error } = await supabase
          .from('assignment_grades')
          .update({
            grade: Number(grade),
            feedback: teacherFeedback,
            graded_at: new Date().toISOString(),
          })
          .eq('id', existingGrade.id);

        if (error) throw error;
      } else {
        // Insert new grade
        const { error } = await supabase
          .from('assignment_grades')
          .insert({
            submission_id: selectedSubmission.id,
            grader_user_id: user?.id,
            grade: Number(grade),
            feedback: teacherFeedback,
            graded_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      toast({
        title: "✅ Feedback Sent!",
        description: "The student has been notified of their grade.",
      });

      setDrawerOpen(false);
      fetchSubmissions(); // Refresh data
    } catch (err) {
      console.error('Error saving review:', err);
      toast({
        title: "Error",
        description: "Failed to save feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const pendingSubmissions = submissions.filter(s => !s.grade_info);
  const reviewedSubmissions = submissions.filter(s => s.grade_info);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-96" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Review & Feedback Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review student submissions, approve AI feedback, and send grades
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewedSubmissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reviewedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {pendingSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">All caught up!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      No pending submissions to review
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>AI Feedback</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {submission.student.first_name} {submission.student.last_name}
                          </TableCell>
                          <TableCell>{submission.assignment.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(submission.submitted_at)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {submission.ai_feedback ? (
                              <Badge variant="outline" className="bg-primary/5">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Generated
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                None
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => openReviewDrawer(submission)}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviewed" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {reviewedSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">No reviewed submissions yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Graded On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewedSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {submission.student.first_name} {submission.student.last_name}
                          </TableCell>
                          <TableCell>{submission.assignment.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {submission.grade_info?.grade}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {submission.grade_info?.graded_at &&
                              formatDate(submission.grade_info.graded_at)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewDrawer(submission)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-3xl mx-auto max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>
              {selectedSubmission?.assignment.title}
            </DrawerTitle>
            <DrawerDescription>
              {selectedSubmission?.student.first_name}{' '}
              {selectedSubmission?.student.last_name} •{' '}
              Submitted {selectedSubmission && formatDate(selectedSubmission.submitted_at)}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 space-y-4 overflow-y-auto">
            <div>
              <Label className="text-sm font-medium">Student Submission</Label>
              <ScrollArea className="h-32 border rounded-md p-4 mt-2 bg-muted/30">
                <p className="whitespace-pre-wrap text-sm">
                  {selectedSubmission?.text_response || 'No text submission provided'}
                </p>
              </ScrollArea>
            </div>

            {selectedSubmission?.ai_feedback && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Feedback
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRegenrateAI}
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Re-Run AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={selectedSubmission.ai_feedback}
                  readOnly
                  className="min-h-24 bg-primary/5"
                />
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Generated by TailorEDU AI Assistant
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="teacher-feedback" className="text-sm font-medium">
                Your Feedback
              </Label>
              <Textarea
                id="teacher-feedback"
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder="Edit AI feedback or write your own..."
                className="min-h-32 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="grade" className="text-sm font-medium">
                Grade (0-100)
              </Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade"
                className="mt-2"
              />
            </div>
          </div>

          <DrawerFooter className="flex-row justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReview}
              disabled={saving || !grade}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Save & Send to Student
                </>
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
