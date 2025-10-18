import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import ParentStudentOverview from "@/components/parent/ParentStudentOverview";
import ParentFeedbackSection from "@/components/parent/ParentFeedbackSection";
import ParentAiInsights from "@/components/parent/ParentAiInsights";

interface StudentData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  classes: ClassData[];
  language_preference: string;
}

interface ClassData {
  id: string;
  title: string;
  submissions: SubmissionData[];
}

interface SubmissionData {
  id: string;
  assignment_title: string;
  grade: number;
  feedback: string;
  ai_feedback: string;
  submitted_at: string;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [parentProfile, setParentProfile] = useState<any>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    if (user) {
      fetchParentData();
    }
  }, [user]);

  const fetchParentData = async () => {
    try {
      setLoading(true);

      // Get parent profile
      const { data: parent, error: parentError } = await supabase
        .from("parent_profiles")
        .select("id, user_id, first_name, last_name")
        .eq("user_id", user?.id)
        .single();

      if (parentError) throw parentError;
      setParentProfile(parent);

      // Get linked student(s) - for now we'll get the first one
      const { data: relationships, error: relError } = await supabase
        .from("student_parent_relationships")
        .select(`
          student_id,
          students!inner(
            id,
            user_id,
            first_name,
            last_name,
            grade_level,
            language_preference
          )
        `)
        .eq("parent_id", parent.id);

      if (relError) throw relError;

      if (!relationships || relationships.length === 0) {
        toast({
          title: "No Students Linked",
          description: "No students are currently linked to your account. Please contact your school administrator.",
        });
        setLoading(false);
        return;
      }

      // Get first student's data
      const student = relationships[0].students;
      
      // Get student's classes and submissions
      const { data: classStudents, error: classError } = await supabase
        .from("class_students")
        .select(`
          class_id,
          classes!inner(
            id,
            title
          )
        `)
        .eq("student_id", student.id);

      if (classError) throw classError;

      // Get all submissions for this student
      const { data: submissions, error: subError } = await supabase
        .from("assignment_submissions")
        .select(`
          id,
          submitted_at,
          assignment_submissions:assignment_id(
            assignments!inner(
              id,
              title,
              class_assignments_new!inner(
                class_id
              )
            )
          ),
          assignment_grades(
            grade,
            feedback
          )
        `)
        .eq("user_id", student.user_id)
        .order("submitted_at", { ascending: false });

      if (subError) throw subError;

      // Process classes with their submissions
      const classesMap = new Map<string, ClassData>();
      
      classStudents?.forEach((cs: any) => {
        classesMap.set(cs.class_id, {
          id: cs.classes.id,
          title: cs.classes.title,
          submissions: [],
        });
      });

      // Add submissions to classes
      submissions?.forEach((sub: any) => {
        const assignment = sub.assignment_submissions?.assignments;
        if (assignment && assignment.class_assignments_new && assignment.class_assignments_new.length > 0) {
          const classId = assignment.class_assignments_new[0].class_id;
          const classData = classesMap.get(classId);
          
          if (classData) {
            const grades = sub.assignment_grades || [];
            const latestGrade = grades[grades.length - 1];
            
            classData.submissions.push({
              id: sub.id,
              assignment_title: assignment.title,
              grade: latestGrade?.grade || 0,
              feedback: latestGrade?.feedback || '',
              ai_feedback: '', // AI feedback will be generated separately
              submitted_at: sub.submitted_at,
            });
          }
        }
      });

      setStudentData({
        id: student.id,
        user_id: student.user_id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade_level: student.grade_level,
        language_preference: student.language_preference,
        classes: Array.from(classesMap.values()),
      });

    } catch (error) {
      console.error("Error fetching parent data:", error);
      toast({
        title: "Error",
        description: "Failed to load student data",
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

  if (!studentData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>No Student Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No student is currently linked to your account. Please contact your school administrator.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const parentName = parentProfile?.first_name || 'Parent';
  const preferredLanguage = 'en'; // Parent language preference can be added to parent_profiles if needed

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/parent")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-semibold">
                Welcome, {parentName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's {studentData.first_name}'s progress
              </p>
            </div>
          </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ParentStudentOverview 
              studentData={studentData}
              preferredLanguage={preferredLanguage}
            />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <ParentFeedbackSection
              classes={studentData.classes}
              preferredLanguage={preferredLanguage}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <ParentAiInsights
              studentData={studentData}
              preferredLanguage={preferredLanguage}
            />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
