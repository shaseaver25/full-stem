import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BookOpen, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecentActivityCard } from './RecentActivityCard';
import { TeacherInvitation } from './TeacherInvitation';

export const SchoolAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">School Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage teachers, students, and school-wide analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/course-editor">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </Link>
          <Link to="/admin/build-class">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">486</div>
            <p className="text-xs text-muted-foreground">+18 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Across all grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+3% from last term</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teacher Activity</CardTitle>
            <CardDescription>Classes created and engagement this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Classes Created</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Assignments Posted</span>
                <span className="font-bold">32</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Teachers</span>
                <span className="font-bold">22/24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <CardDescription>Login activity and assignment completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Logins (Avg)</span>
                <span className="font-bold">384</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Assignment Completion</span>
                <span className="font-bold">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active This Week</span>
                <span className="font-bold">468/486</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
            <Link to="/dashboard/admin/analytics">
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </Link>
            <Link to="/content">
              <Button variant="outline" className="w-full">
                Content Library
              </Button>
            </Link>
            <Link to="/admin/quizzes">
              <Button variant="outline" className="w-full">
                All Quizzes
              </Button>
            </Link>
            <Link to="/admin/polls">
              <Button variant="outline" className="w-full">
                All Polls
              </Button>
            </Link>
            <Link to="/admin/advanced">
              <Button variant="outline" className="w-full">
                Advanced Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Invitation */}
      <TeacherInvitation />

      {/* Recent Activity */}
      <RecentActivityCard />
    </div>
  );
};
