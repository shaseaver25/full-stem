import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Mail, User, FileText, Folder } from 'lucide-react';
import { useClassDetails } from '@/hooks/useClassDetails';
import { useClassLessons } from '@/hooks/useClassLessons';
import { Skeleton } from '@/components/ui/skeleton';

const formatDate = (dateString: string) => 
  new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: classData, isLoading, error } = useClassDetails(id || '');
  const { data: lessons = [], isLoading: lessonsLoading } = useClassLessons(id || '');

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!id) {
    return <Navigate to="/classes/my-classes" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/classes/my-classes">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Class Not Found</h1>
          </div>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                {error.message === 'Not enrolled in this class' 
                  ? "You're not enrolled in this class. Please join it first."
                  : "Unable to load class details. Please try again."}
              </p>
              <Button asChild>
                <Link to="/classes/my-classes">Back to My Classes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/classes/my-classes">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Class Details</h1>
        </div>

        {/* Class Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{classData.title}</CardTitle>
            {classData.description && (
              <CardDescription className="text-base mt-2">
                {classData.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {classData.teacher && (
                <>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Teacher</p>
                      <p className="text-sm text-muted-foreground">{classData.teacher.name}</p>
                    </div>
                  </div>
                  {classData.teacher.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{classData.teacher.email}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              {classData.schedule && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Schedule</p>
                    <p className="text-sm text-muted-foreground">{classData.schedule}</p>
                  </div>
                </div>
              )}
              {classData.subject && (
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Subject</p>
                    <p className="text-sm text-muted-foreground">{classData.subject}</p>
                  </div>
                </div>
              )}
              {classData.grade_level && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Grade Level</p>
                    <p className="text-sm text-muted-foreground">{classData.grade_level}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Enrolled</p>
                  <p className="text-sm text-muted-foreground">{formatDate(classData.enrolled_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <CardTitle>Lessons</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {lessonsLoading ? (
              <p className="text-muted-foreground">Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <p className="text-muted-foreground">No lessons are available for this class yet.</p>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/student/lesson/${lesson.id}`)}
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <CardTitle>Assignments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No assignments available yet.</p>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              <CardTitle>Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No resources available yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
