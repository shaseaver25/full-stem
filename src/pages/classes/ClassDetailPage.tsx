import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/classes/my-classes">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Class Details</h1>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-12">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <BookOpen className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Class Page Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This page will display your class lessons, assignments, and resources.
            </p>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Features in development:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>View class lessons and materials</li>
                <li>Submit assignments</li>
                <li>Track your progress</li>
                <li>Communicate with your teacher</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <Button asChild>
                <Link to="/classes/my-classes">Back to My Classes</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/student">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
