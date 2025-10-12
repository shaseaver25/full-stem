import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EditProfileModal } from '@/components/dashboard/EditProfileModal';
import Header from '@/components/Header';
import { GraduationCap, Brain, Mail, User, BookOpen } from 'lucide-react';

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading, error } = useStudentProfile();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Auth protection
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-48 w-full" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-48" />
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
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-destructive">
              Unable to Load Profile
            </h2>
            <p className="text-muted-foreground mb-4">
              We couldn't load your profile data. This might be because your profile hasn't been set up yet.
            </p>
            <Button asChild>
              <Link to="/signup/student">Complete Profile Setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Welcome to TailorEDU!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Let's get started by completing your profile.
            </p>
            <Button asChild>
              <Link to="/signup/student">Complete Your Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile.first_name || 'Student';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Welcome, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to personalize your learning journey?
          </p>
        </div>

        {/* Profile Summary Card */}
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Grade Level</p>
                  <p className="font-medium">Grade {profile.grade_level}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {profile.first_name} {profile.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <GraduationCap className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">Student</p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setEditModalOpen(true)}
            >
              Edit My Profile
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/quiz/learning-genius" className="block">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Take Learning Genius Quiz
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Discover your unique learning style and get personalized recommendations
                  </p>
                </div>
                <Button className="w-full">
                  Start Quiz →
                </Button>
              </CardContent>
            </Link>
          </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                My Classes
              </h3>
              <p className="text-sm text-muted-foreground">
                View all your enrolled classes, assignments, and learning progress
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/classes/my-classes">
                View Classes →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link to="/classes/join" className="block">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Join a Class
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect with your teacher and access your personalized lessons
                </p>
              </div>
              <Button variant="secondary" className="w-full">
                Browse Classes →
              </Button>
            </CardContent>
          </Link>
        </Card>
        </div>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help getting started?{' '}
            <a href="#" className="text-primary hover:underline">
              View the student guide
            </a>
          </p>
        </div>
      </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          currentGrade={profile.grade_level}
        />
      </div>
    </div>
  );
}
