import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Award, TrendingUp, Target, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecentActivityCard } from './RecentActivityCard';

export const WorkforceAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Workforce Center Dashboard</h2>
          <p className="text-muted-foreground">
            Track participant progress and certification outcomes
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/build-class">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Participant
            </Button>
          </Link>
          <Link to="/admin/ai-course-builder">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">+5% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Across 4 programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Program Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Program Performance</CardTitle>
            <CardDescription>Enrollment and completion by program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Digital Skills Training</span>
                <span className="font-bold">45/52</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Healthcare Certification</span>
                <span className="font-bold">38/41</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Business Management</span>
                <span className="font-bold">31/35</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills Tracking</CardTitle>
            <CardDescription>Competencies achieved across all participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Technical Skills</span>
                <span className="font-bold">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Soft Skills</span>
                <span className="font-bold">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Job Readiness</span>
                <span className="font-bold">72%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Analytics</CardTitle>
          <CardDescription>Group performance and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Cohort A - Spring 2025</p>
                  <p className="text-xs text-muted-foreground">Digital Skills (42 participants)</p>
                </div>
                <span className="text-sm font-bold">89% completion</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Cohort B - Spring 2025</p>
                  <p className="text-xs text-muted-foreground">Healthcare (38 participants)</p>
                </div>
                <span className="text-sm font-bold">92% completion</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Link to="/dashboard/admin/analytics">
              <Button variant="outline" className="w-full">
                View Certifications
              </Button>
            </Link>
            <Link to="/admin/course-editor">
              <Button variant="outline" className="w-full">
                Manage Programs
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

      {/* Recent Activity */}
      <RecentActivityCard />
    </div>
  );
};
