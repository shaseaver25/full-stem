import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { HelpHint } from "@/components/common/HelpHint";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import SchoolOverview from "@/components/analytics/SchoolOverview";
import TeacherBreakdown from "@/components/analytics/TeacherBreakdown";
import AdminAiInsights from "@/components/analytics/AdminAiInsights";

interface AnalyticsData {
  teachers: TeacherStats[];
  totalStudents: number;
  totalClasses: number;
  overallAverage: number;
  totalSubmissions: number;
}

interface TeacherStats {
  teacher_id: string;
  name: string;
  classCount: number;
  averageGrade: number;
  completionRate: number;
  totalSubmissions: number;
}

const AdminAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all classes with related data
      const { data: classes, error: classesError } = await supabase
        .from("classes")
        .select(`
          id,
          title,
          teacher_id,
          teacher_profiles!inner(
            id,
            user_id
          ),
          class_students!inner(student_id),
          class_assignments_new!inner(
            id,
            assignments!inner(
              id,
              title,
              assignment_submissions!inner(
                id,
                user_id,
                assignment_grades(grade)
              )
            )
          )
        `);

      if (classesError) throw classesError;

      // Get teacher profiles with user data
      const { data: teacherProfiles, error: profilesError } = await supabase
        .from("teacher_profiles")
        .select(`
          id,
          user_id
        `);

      if (profilesError) throw profilesError;

      // Get profiles for the teacher user IDs
      const teacherUserIds = teacherProfiles?.map(tp => tp.user_id) || [];
      const { data: profiles, error: profilesDataError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", teacherUserIds);

      if (profilesDataError) throw profilesDataError;

      // Create a map of user_id to name
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name || 'Unknown Teacher']));

      // Create a map of teacher_id to teacher info
      const teacherMap = new Map(
        teacherProfiles?.map(tp => [
          tp.id,
          { name: profileMap.get(tp.user_id) || 'Unknown Teacher', user_id: tp.user_id }
        ])
      );

      // Process data by teacher
      const teacherStatsMap = new Map<string, {
        name: string;
        classes: Set<string>;
        grades: number[];
        totalSubmissions: number;
        totalStudents: number;
      }>();

      let totalStudents = 0;
      let totalGrades = 0;
      let gradeCount = 0;
      let totalSubmissions = 0;

      classes?.forEach((classItem: any) => {
        const teacherId = classItem.teacher_id;
        const teacherInfo = teacherMap.get(teacherId);
        
        if (!teacherInfo) return;

        if (!teacherStatsMap.has(teacherId)) {
          teacherStatsMap.set(teacherId, {
            name: teacherInfo.name,
            classes: new Set(),
            grades: [],
            totalSubmissions: 0,
            totalStudents: 0,
          });
        }

        const teacherStats = teacherStatsMap.get(teacherId)!;
        teacherStats.classes.add(classItem.id);
        teacherStats.totalStudents += classItem.class_students?.length || 0;

        classItem.class_assignments_new?.forEach((assignment: any) => {
          assignment.assignments?.forEach((assignmentDetail: any) => {
            const submissions = assignmentDetail.assignment_submissions || [];
            teacherStats.totalSubmissions += submissions.length;
            totalSubmissions += submissions.length;

            submissions.forEach((sub: any) => {
              const grades = sub.assignment_grades || [];
              grades.forEach((gradeRecord: any) => {
                if (gradeRecord.grade != null) {
                  const gradeValue = Number(gradeRecord.grade);
                  teacherStats.grades.push(gradeValue);
                  totalGrades += gradeValue;
                  gradeCount++;
                }
              });
            });
          });
        });

        totalStudents += classItem.class_students?.length || 0;
      });

      // Calculate teacher statistics
      const teachers: TeacherStats[] = Array.from(teacherStatsMap.entries()).map(
        ([teacher_id, stats]) => {
          const averageGrade = stats.grades.length > 0
            ? stats.grades.reduce((sum, g) => sum + g, 0) / stats.grades.length
            : 0;
          
          const completionRate = stats.totalStudents > 0
            ? (stats.totalSubmissions / stats.totalStudents) * 100
            : 0;

          return {
            teacher_id,
            name: stats.name,
            classCount: stats.classes.size,
            averageGrade,
            completionRate: Math.min(completionRate, 100),
            totalSubmissions: stats.totalSubmissions,
          };
        }
      );

      const overallAverage = gradeCount > 0 ? totalGrades / gradeCount : 0;

      setAnalyticsData({
        teachers,
        totalStudents,
        totalClasses: classes?.length || 0,
        overallAverage,
        totalSubmissions,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Analytics' },
          ]}
        />
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-3xl font-semibold">School-Wide Analytics</h1>
              <p className="text-muted-foreground mt-1">
                View performance metrics and AI insights across all teachers and classes
              </p>
            </div>
            <HelpHint
              text="View detailed metrics on student performance, teacher activity, and system usage. Use these insights to make data-driven decisions."
              learnMoreUrl="https://docs.lovable.dev/features/analytics"
            />
          </div>
        </div>

        {!analyticsData || analyticsData.teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No analytics data available yet.</p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="teachers">By Teacher</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <SchoolOverview analyticsData={analyticsData} />
            </TabsContent>

            <TabsContent value="teachers" className="space-y-6">
              <TeacherBreakdown teachers={analyticsData.teachers} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <AdminAiInsights analyticsData={analyticsData} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
