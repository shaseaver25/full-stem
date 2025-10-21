import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { StudentDashboardHeader } from '@/components/student/StudentDashboardHeader';
import { StudentInsightsPanel } from '@/components/student/StudentInsightsPanel';
import { StudentGoalsSection } from '@/components/student/StudentGoalsSection';
import { StudentReflectionJournal } from '@/components/student/StudentReflectionJournal';
import { StudentAssignmentsList } from '@/components/student/StudentAssignmentsList';
import { WeeklyDigestBanner } from '@/components/student/WeeklyDigestBanner';
import { StudentClassesSection } from '@/components/student/StudentClassesSection';
import {
  useStudentProfile,
  useStudentInsights,
  useStudentGoals,
  useStudentReflections,
  useStudentAssignments,
  useStudentStats,
  useUpdateGoalStatus,
  useRefreshInsights,
  useWeeklyDigest,
} from '@/hooks/useStudentDashboard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: insights = [], isLoading: insightsLoading } = useStudentInsights(profile?.id);
  const { data: goals = [] } = useStudentGoals(profile?.id);
  const { data: reflections = [] } = useStudentReflections(profile?.id);
  const { data: assignments = [] } = useStudentAssignments(user?.id);
  const { data: stats } = useStudentStats(profile?.id, user?.id);
  const { data: weeklyDigest } = useWeeklyDigest(profile?.id);
  const updateGoalStatus = useUpdateGoalStatus();
  const refreshInsights = useRefreshInsights();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6 max-w-7xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                Student profile not found. Please contact your teacher.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header with Student Info and Stats */}
        <StudentDashboardHeader
          firstName={profile.first_name}
          lastName={profile.last_name}
          stats={stats}
          readingLevel={profile.reading_level}
          languagePreference={profile.language_preference}
          iepAccommodations={profile.iep_accommodations}
        />

        {/* Weekly Digest Banner */}
        {weeklyDigest && (
          <WeeklyDigestBanner 
            digest={weeklyDigest}
            studentName={profile.first_name}
          />
        )}

        {/* My Classes Section */}
        <StudentClassesSection />

        {/* AI Learning Insights */}
        <StudentInsightsPanel
          insights={insights}
          isLoading={insightsLoading}
          onRefresh={() => refreshInsights.mutate(profile.id)}
          isRefreshing={refreshInsights.isPending}
        />

        {/* Two Column Layout for Goals and Reflections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Goals */}
          <StudentGoalsSection
            goals={goals}
            studentId={profile.id}
            onStatusChange={(goalId, status) => 
              updateGoalStatus.mutate({ goalId, status })
            }
          />

          {/* Reflection Journal */}
          <StudentReflectionJournal
            reflections={reflections}
            studentId={profile.id}
            completedGoals={completedGoals}
          />
        </div>

        {/* Assignments & Progress */}
        <StudentAssignmentsList
          assignments={assignments}
          stats={stats}
        />
      </div>
    </div>
  );
}