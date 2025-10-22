import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
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
  console.log('[StudentDashboard] Component mounting');
  const { user } = useAuth();
  const [isElevatedRole, setIsElevatedRole] = useState<boolean | null>(null);
  const { data: profile, isLoading: profileLoading, error: profileError } = useStudentProfile();
  
  console.log('[StudentDashboard] Profile state:', { 
    profileLoading, 
    hasProfile: !!profile,
    profileError: profileError?.message 
  });
  const { data: insights = [], isLoading: insightsLoading } = useStudentInsights(profile?.id);
  const { data: goals = [] } = useStudentGoals(profile?.id);
  const { data: reflections = [] } = useStudentReflections(profile?.id);
  const { data: assignments = [] } = useStudentAssignments(user?.id);
  const { data: stats } = useStudentStats(profile?.id, user?.id);
  const { data: weeklyDigest } = useWeeklyDigest(profile?.id);
  const updateGoalStatus = useUpdateGoalStatus();
  const refreshInsights = useRefreshInsights();

  // Check for elevated roles (super_admin or developer)
  useEffect(() => {
    const checkElevatedRole = async () => {
      if (!user) {
        console.log('[StudentDashboard] No user for elevated role check');
        setIsElevatedRole(false);
        return;
      }

      console.log('[StudentDashboard] Checking elevated role for user:', user.id);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['super_admin', 'developer']);

        if (error) {
          console.error('[StudentDashboard] Error checking elevated role:', error);
          setIsElevatedRole(false);
        } else {
          const isElevated = data && data.length > 0;
          console.log('[StudentDashboard] Elevated role check result:', { roles: data, isElevated });
          setIsElevatedRole(isElevated);
        }
      } catch (error) {
        console.error('[StudentDashboard] Exception checking elevated role:', error);
        setIsElevatedRole(false);
      }
    };

    checkElevatedRole();
  }, [user]);

  if (!user) {
    console.log('[StudentDashboard] No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('[StudentDashboard] State:', { 
    profileLoading, 
    isElevatedRole, 
    hasProfile: !!profile,
    profileId: profile?.id 
  });

  if (profileLoading || isElevatedRole === null) {
    console.log('[StudentDashboard] Loading...');
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

  // Allow elevated roles to view without a profile
  if (!profile && !isElevatedRole) {
    console.log('[StudentDashboard] No profile and not elevated role');
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

  // Super admins/developers viewing without profile - show admin view
  if (!profile && isElevatedRole) {
    console.log('[StudentDashboard] Elevated role without profile - showing admin view');
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6 max-w-7xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Student Dashboard (Admin View)</h2>
                <p className="text-muted-foreground">
                  You are viewing this page as a super admin/developer without a student profile.
                </p>
                <p className="text-sm text-muted-foreground">
                  To see the full student experience, you would need a student profile assigned to your account.
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => window.location.href = '/dev'}>
                    Go to Developer Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedGoals = goals.filter(g => g.status === 'completed');

  console.log('[StudentDashboard] Rendering full dashboard with profile:', profile?.id);

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