import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useTeacherProfileSimplified } from '@/hooks/useTeacherProfileSimplified';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { MetricsOverview } from './dashboard/MetricsOverview';
import { ClassesList } from './dashboard/ClassesList';
import { QuickActions } from './dashboard/QuickActions';
import { AnalyticsPreview } from './dashboard/AnalyticsPreview';

interface DashboardData {
  activeClasses: number;
  totalStudents: number;
  assignmentsDueThisWeek: number;
  averageEngagement: number;
  unreadMessages: number;
  classes: any[];
  completionTrend: Array<{ date: string; completion: number }>;
  classAverages: Array<{ className: string; average: number }>;
}

const TeacherDashboard = () => {
  const { profile, loading: profileLoading } = useTeacherProfileSimplified();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activeClasses: 0,
    totalStudents: 0,
    assignmentsDueThisWeek: 0,
    averageEngagement: 0,
    unreadMessages: 0,
    classes: [],
    completionTrend: [],
    classAverages: []
  });

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData();
    }
  }, [profile?.id]);

  const fetchDashboardData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      // Fetch classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          subject,
          grade_level,
          class_students(count)
        `)
        .eq('teacher_id', profile.id);

      if (classesError) throw classesError;

      // Calculate metrics
      const classesWithCounts = classes?.map(c => ({
        ...c,
        enrollment_count: c.class_students?.[0]?.count || 0
      })) || [];

      const totalStudents = classesWithCounts.reduce(
        (sum, c) => sum + c.enrollment_count,
        0
      );

      // Calculate assignments due this week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999);

      const classIds = classes?.map(c => c.id) || [];
      let assignmentsDueCount = 0;

      if (classIds.length > 0) {
        const { count, error: assignmentsError } = await supabase
          .from('class_assignments_new')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .gte('due_at', startOfWeek.toISOString())
          .lte('due_at', endOfWeek.toISOString());

        if (!assignmentsError) {
          assignmentsDueCount = count || 0;
        }
      }

      // Mock data for other metrics (replace with real queries)
      const completionTrend = [
        { date: 'Mon', completion: 75 },
        { date: 'Tue', completion: 82 },
        { date: 'Wed', completion: 78 },
        { date: 'Thu', completion: 85 },
        { date: 'Fri', completion: 88 },
      ];

      const classAverages = classesWithCounts.slice(0, 5).map(c => ({
        className: c.name,
        average: Math.floor(Math.random() * 20) + 75 // Mock data
      }));

      setDashboardData({
        activeClasses: classes?.length || 0,
        totalStudents,
        assignmentsDueThisWeek: assignmentsDueCount,
        averageEngagement: 82, // TODO: Calculate from activity
        unreadMessages: 0, // TODO: Calculate from messages
        classes: classesWithCounts,
        completionTrend,
        classAverages
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // If profile is null after loading, show a message
  if (!profile && !profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Setting Up Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We're creating your teacher profile. This should only take a moment.
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.school_name || 'Teacher'}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your classes today
          </p>
        </div>

        {/* Metrics Overview */}
        <MetricsOverview
          totalStudents={dashboardData.totalStudents}
          assignmentsDueThisWeek={dashboardData.assignmentsDueThisWeek}
          averageEngagement={dashboardData.averageEngagement}
        />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Classes List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ClassesList classes={dashboardData.classes} loading={loading} />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Analytics Preview */}
        <AnalyticsPreview
          completionTrend={dashboardData.completionTrend}
          classAverages={dashboardData.classAverages}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;
