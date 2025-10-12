import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, CheckCircle, Lightbulb, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomeschoolAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Homeschool Dashboard</h2>
          <p className="text-muted-foreground">
            Track your family's learning progress and manage curriculum
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/build-class">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Link>
          <Link to="/admin/ai-course-builder">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Configured</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">All active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">On track</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Path & Resources */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Family Progress</CardTitle>
            <CardDescription>Overview of your students' achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Assignments Completed</span>
                <span className="font-bold">45/48</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lessons in Progress</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Score</span>
                <span className="font-bold">92%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Suggestions</CardTitle>
            <CardDescription>Recommended content and curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium">Math: Fractions & Decimals</p>
                <p className="text-xs text-muted-foreground">Recommended for Grade 5</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium">Science: The Solar System</p>
                <p className="text-xs text-muted-foreground">Engaging content available</p>
              </div>
              <Link to="/content">
                <Button variant="link" className="p-0 h-auto">
                  Browse all resources →
                </Button>
              </Link>
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
          <div className="grid gap-2 md:grid-cols-3">
            <Link to="/admin/course-editor">
              <Button variant="outline" className="w-full">
                Manage Courses
              </Button>
            </Link>
            <Link to="/content">
              <Button variant="outline" className="w-full">
                Browse Resources
              </Button>
            </Link>
            <Link to="/dashboard/admin/analytics">
              <Button variant="outline" className="w-full">
                View Progress
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
