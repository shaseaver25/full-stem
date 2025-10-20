import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, BookOpen, GraduationCap, Languages, Brain, Settings, Target, Sparkles, MessageSquare, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import { StudentGoalsSection } from '@/components/teacher/student-detail/StudentGoalsSection';
import { StudentInsightsSection } from '@/components/teacher/student-detail/StudentInsightsSection';
import { StudentReflectionsSection } from '@/components/teacher/student-detail/StudentReflectionsSection';
import { StudentPerformanceChart } from '@/components/teacher/student-detail/StudentPerformanceChart';

interface Student {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  grade_level: string | null;
  reading_level: string | null;
  learning_style: string | null;
  language_preference: string | null;
  interests: string[] | null;
  iep_accommodations: string[] | null;
  lesson_modifications: string[] | null;
  created_at: string;
  updated_at: string;
}

interface ClassEnrollment {
  class_id: string;
  status: string;
  enrolled_at: string;
  classes: {
    id: string;
    name: string;
    subject: string;
  };
}

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      return data as Student;
    },
    enabled: !!studentId,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['student-enrollments', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          class_id,
          status,
          enrolled_at,
          classes:class_id (
            id,
            name,
            subject
          )
        `)
        .eq('student_id', studentId);

      if (error) throw error;
      return data as ClassEnrollment[];
    },
    enabled: !!studentId,
  });

  if (studentLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Student not found</p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => navigate(-1)}>Go Back</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const LESSON_MODIFICATION_OPTIONS = [
    { value: 'text_simplification', label: 'Text Simplification' },
    { value: 'extended_time', label: 'Extended Time' },
    { value: 'visual_aids', label: 'Visual Aids' },
    { value: 'chunking', label: 'Chunking' },
    { value: 'audio_support', label: 'Audio Support' },
    { value: 'preferential_seating', label: 'Preferential Seating' },
    { value: 'reduced_distractions', label: 'Reduced Distractions' },
    { value: 'frequent_breaks', label: 'Frequent Breaks' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Student Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {student.first_name} {student.last_name}
                    </CardTitle>
                    {student.grade_level && (
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <GraduationCap className="h-4 w-4" />
                        Grade {student.grade_level}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Learning Profile */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Learning Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {student.reading_level && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Reading Level:</span>
                      <Badge variant="secondary">{student.reading_level}</Badge>
                    </div>
                  )}
                  {student.learning_style && (
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Learning Style:</span>
                      <Badge variant="outline">{student.learning_style}</Badge>
                    </div>
                  )}
                  {student.language_preference && (
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Language:</span>
                      <Badge variant="outline">{student.language_preference}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Interests */}
              {student.interests && student.interests.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Interests</h3>
                    <div className="flex gap-2 flex-wrap">
                      {student.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Lesson Modifications */}
              {student.lesson_modifications && student.lesson_modifications.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Lesson Modifications
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {student.lesson_modifications.map((mod, index) => {
                        const option = LESSON_MODIFICATION_OPTIONS.find(opt => opt.value === mod);
                        return (
                          <Badge key={index} variant="outline">
                            {option?.label || mod}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* IEP Accommodations */}
              {student.iep_accommodations && student.iep_accommodations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">IEP Accommodations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {student.iep_accommodations.map((accommodation, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {accommodation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Enrolled Classes */}
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Enrolled Classes</h3>
                {enrollmentsLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : enrollments && enrollments.length > 0 ? (
                  <div className="space-y-2">
                    {enrollments.map((enrollment) => (
                      <Link
                        key={enrollment.class_id}
                        to={`/classes/${enrollment.class_id}`}
                      >
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                          <CardContent className="pt-3 pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{enrollment.classes.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {enrollment.classes.subject}
                                </p>
                              </div>
                              <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                                {enrollment.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Not enrolled in any classes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Performance, Goals, Insights, and Reflections */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="reflections" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Reflections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <StudentPerformanceChart studentId={studentId!} userId={student.user_id} />
            </TabsContent>

            <TabsContent value="goals">
              <StudentGoalsSection studentId={studentId!} />
            </TabsContent>

            <TabsContent value="insights">
              <StudentInsightsSection studentId={studentId!} />
            </TabsContent>

            <TabsContent value="reflections">
              <StudentReflectionsSection studentId={studentId!} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}