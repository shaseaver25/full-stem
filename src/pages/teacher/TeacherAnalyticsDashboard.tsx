import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import OverviewSection from "@/components/analytics/OverviewSection";
import AssignmentBreakdown from "@/components/analytics/AssignmentBreakdown";
import AiInsightsSection from "@/components/analytics/AiInsightsSection";
import Header from "@/components/Header";
import { TeacherActivityView } from "@/components/activity/TeacherActivityView";

interface ClassStats {
  id: string;
  title: string;
  averageGrade: number;
  completionRate: number;
  totalStudents: number;
  totalSubmissions: number;
}

interface AssignmentData {
  id: string;
  title: string;
  averageGrade: number;
  submissionCount: number;
  classTitle: string;
}

const TeacherAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useTeacherProfile();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [assignmentData, setAssignmentData] = useState<AssignmentData[]>([]);

  useEffect(() => {
    if (user && profile) {
      fetchAnalyticsData();
    }
  }, [user, profile]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch teacher's classes with submissions and grades
      const { data: classes, error: classesError } = await supabase
        .from("classes")
        .select(`
          id,
          title,
          class_students!inner(student_id),
          class_assignments_new!inner(
            id,
            lesson_id,
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
        `)
        .eq("teacher_id", profile?.id);

      if (classesError) throw classesError;

      // Process class statistics
      const stats: ClassStats[] = [];
      const assignments: AssignmentData[] = [];

      classes?.forEach((classItem: any) => {
        const totalStudents = classItem.class_students?.length || 0;
        let totalGrade = 0;
        let totalSubmissions = 0;
        let gradeCount = 0;

        classItem.class_assignments_new?.forEach((assignment: any) => {
          assignment.assignments?.forEach((assignmentDetail: any) => {
            const submissions = assignmentDetail.assignment_submissions || [];
            totalSubmissions += submissions.length;

            let assignmentGradeSum = 0;
            let assignmentGradeCount = 0;

            submissions.forEach((sub: any) => {
              const grades = sub.assignment_grades || [];
              grades.forEach((gradeRecord: any) => {
                if (gradeRecord.grade != null) {
                  const gradeValue = Number(gradeRecord.grade);
                  totalGrade += gradeValue;
                  gradeCount++;
                  assignmentGradeSum += gradeValue;
                  assignmentGradeCount++;
                }
              });
            });

            // Store assignment-level data
            if (assignmentGradeCount > 0) {
              assignments.push({
                id: assignmentDetail.id,
                title: assignmentDetail.title,
                averageGrade: assignmentGradeSum / assignmentGradeCount,
                submissionCount: submissions.length,
                classTitle: classItem.title,
              });
            }
          });
        });

        const completionRate = totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0;
        const averageGrade = gradeCount > 0 ? totalGrade / gradeCount : 0;

        stats.push({
          id: classItem.id,
          title: classItem.title,
          averageGrade,
          completionRate,
          totalStudents,
          totalSubmissions,
        });
      });

      setClassStats(stats);
      setAssignmentData(assignments);
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/teacher/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">Class Analytics</h1>
            <p className="text-muted-foreground mt-1">
              View performance metrics and AI-generated insights for your classes
            </p>
          </div>
        </div>

        {classStats.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                You don't have any classes with submissions yet. Start by creating assignments!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <OverviewSection classStats={classStats} />
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <AssignmentBreakdown assignments={assignmentData} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <AiInsightsSection 
                classStats={classStats}
                preferredLanguage="en"
              />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <TeacherActivityView />
            </TabsContent>
          </Tabs>
        )}
      </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsDashboard;
