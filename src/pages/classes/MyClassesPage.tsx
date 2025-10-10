import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentClasses } from '@/hooks/useStudentClasses';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GraduationCap, 
  Calendar, 
  User, 
  BookOpen, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MyClassesPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: classes, isLoading, error } = useStudentClasses();

  const formatEnrollmentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  // Auth protection
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <div className="w-full max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load your classes'}
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link to="/dashboard/student">← Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              My Classes
            </h1>
            <p className="text-muted-foreground mt-2">
              {classes?.length === 0 
                ? "You haven't joined any classes yet"
                : `You're enrolled in ${classes?.length} ${classes?.length === 1 ? 'class' : 'classes'}`
              }
            </p>
          </div>
          <Button asChild>
            <Link to="/classes/join">
              <BookOpen className="w-4 h-4 mr-2" />
              Join a Class
            </Link>
          </Button>
        </div>

        {/* Classes Grid or Empty State */}
        {!classes || classes.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-muted">
                  <GraduationCap className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Classes Yet</h3>
                <p className="text-muted-foreground">
                  Start your learning journey by joining a class with a class code from your teacher.
                </p>
              </div>
              <Button asChild size="lg">
                <Link to="/classes/join">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Join Your First Class
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((enrollment) => {
              const classData = enrollment.classes;
              const teacherName = enrollment.teacher
                ? `${enrollment.teacher.first_name || ''} ${enrollment.teacher.last_name || ''}`.trim()
                : 'TailorEDU Instructor';

              return (
                <Card 
                  key={enrollment.id} 
                  className="shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2">
                      {classData.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {classData.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{teacherName}</span>
                    </div>
                    
                    {classData.subject && (
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {classData.subject}
                          {classData.grade_level && ` • Grade ${classData.grade_level}`}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {classData.schedule || 'Schedule TBA'}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Joined {formatEnrollmentDate(enrollment.enrolled_at)}
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/classes/${classData.id}`}>
                        View Class
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Back to Dashboard Link */}
        {classes && classes.length > 0 && (
          <div className="text-center pt-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard/student">
                ← Back to Dashboard
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
