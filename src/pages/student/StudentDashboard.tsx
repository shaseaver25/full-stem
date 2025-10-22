import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import {
  useStudentProfile,
  useStudentInsights,
  useStudentGoals,
  useStudentAssignments,
  useStudentStats,
  useWeeklyDigest,
} from '@/hooks/useStudentDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Target, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { role } = useUserRole();
  
  // Check if viewing as elevated role
  const isElevatedRole = role === 'super_admin' || role === 'developer' || role === 'admin';
  
  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: insights } = useStudentInsights(profile?.id);
  const { data: goals } = useStudentGoals(profile?.id);
  const { data: assignments } = useStudentAssignments(user?.id);
  const { data: stats } = useStudentStats(profile?.id, user?.id);
  const { data: digest } = useWeeklyDigest(profile?.id);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile && !isElevatedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Student Profile Not Found</CardTitle>
            <CardDescription>
              Your student profile hasn't been set up yet. Please contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{profile ? `, ${profile.first_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            {isElevatedRole ? (
              <Badge variant="outline" className="mt-2">
                Viewing as {role} - Student view
              </Badge>
            ) : (
              "Here's what's happening with your learning journey"
            )}
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageGrade}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <Progress value={parseFloat(stats.completionRate)} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.submittedCount}/{stats.totalAssignments}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {goals?.filter(g => g.status === 'active').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{submission.assignment?.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={
                            submission.status === 'graded' ? 'default' :
                            submission.status === 'submitted' ? 'secondary' :
                            'outline'
                          }>
                            {submission.status}
                          </Badge>
                          {submission.grades?.[0]?.grade && (
                            <span className="text-sm text-muted-foreground">
                              Score: {submission.grades[0].grade}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {submission.assignment?.due_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(submission.assignment.due_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No assignments yet</p>
              )}
              <Button asChild className="w-full mt-4" variant="outline">
                <Link to="/dashboard/student/assignments">View All Assignments</Link>
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Learning Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights && insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="pb-4 border-b last:border-0">
                      <p className="text-sm">{insight.feedback_text}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No insights available yet. Complete more assignments to get personalized feedback!</p>
              )}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                My Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goals && goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="pb-4 border-b last:border-0">
                      <p className="font-medium">{goal.goal_text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                          {goal.status}
                        </Badge>
                        {goal.target_date && (
                          <span className="text-xs text-muted-foreground">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No goals set yet</p>
              )}
              <Button asChild className="w-full mt-4" variant="outline">
                <Link to="/dashboard/student/goals">Manage Goals</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Digest */}
          {digest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  This Week's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{digest.summary_text}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Generated {new Date(digest.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
