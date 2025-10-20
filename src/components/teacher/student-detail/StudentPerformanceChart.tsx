import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, BookOpen, CheckCircle, Clock, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface StudentPerformanceChartProps {
  studentId: string;
  userId: string | null;
}

export function StudentPerformanceChart({ studentId, userId }: StudentPerformanceChartProps) {
  // Fetch lesson progress - mock data for now since lesson_progress table structure needs verification
  const progressData: any[] = [];
  const completedLessons = 0;
  const totalLessons = 0;

  // Fetch assignment submissions and grades
  const { data: submissions = [] } = useQuery({
    queryKey: ['student-submissions', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment:class_assignments_new!inner(title, due_at),
          grades:assignment_grades(grade, graded_at)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Calculate metrics
  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const gradedSubmissions = submissions.filter(s => s.grades && s.grades.length > 0);
  const averageGrade = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, s) => sum + (s.grades[0]?.grade || 0), 0) / gradedSubmissions.length
    : 0;

  const submittedCount = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  const totalAssignments = submissions.length;

  // Prepare chart data for assignments over time
  const assignmentChartData = submissions.slice(0, 8).reverse().map(s => ({
    title: s.assignment?.title?.substring(0, 15) + '...' || 'Assignment',
    grade: s.grades?.[0]?.grade || 0,
    status: s.status,
  }));

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesson Completion</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {completedLessons} of {totalLessons} lessons
            </p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across {gradedSubmissions.length} graded assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedCount}</div>
            <p className="text-xs text-muted-foreground">
              Out of {totalAssignments} total assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((completionRate + (submittedCount / Math.max(totalAssignments, 1) * 100)) / 2).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Based on activity metrics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignment Performance</CardTitle>
          <CardDescription>Grade trends across recent assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {assignmentChartData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No assignment data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="grade" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No assignments yet</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{submission.assignment?.title || 'Untitled'}</p>
                    {submission.assignment?.due_at && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(submission.assignment.due_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {submission.grades?.[0] && (
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {submission.grades[0].grade}%
                        </p>
                      </div>
                    )}
                    <Badge
                      variant={
                        submission.status === 'graded'
                          ? 'default'
                          : submission.status === 'submitted'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}