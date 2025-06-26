
import React, { useState } from 'react';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { useClasses } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import CreateClassModal from './CreateClassModal';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Bell, 
  Calendar,
  MessageCircle,
  Award,
  Plus,
  GraduationCap,
  Settings,
  LogOut,
  ClipboardList
} from 'lucide-react';

const TeacherDashboard = () => {
  const { profile, loading: profileLoading } = useTeacherProfile();
  const { classes, loading: classesLoading, createClass } = useClasses();
  const { user, signOut } = useAuth();
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Students', value: '127', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Classes', value: classes.length.toString(), icon: BookOpen, color: 'bg-green-500' },
    { title: 'Lessons Assigned', value: '23', icon: Calendar, color: 'bg-purple-500' },
    { title: 'Average Progress', value: '78%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const recentActivity = [
    { type: 'assignment', message: 'New assignment submitted by Sarah M.', time: '2 hours ago' },
    { type: 'alert', message: '3 students need attention in Physics Module', time: '4 hours ago' },
    { type: 'feedback', message: 'Lesson feedback received for "Forces & Motion"', time: '1 day ago' },
  ];

  const handleClassCreated = () => {
    console.log('Class created successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Full STEM Teacher Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'Teacher'}!
          </h2>
          <p className="text-gray-600">
            {profile?.school_name && `${profile.school_name} • `}
            Ready to inspire your students today?
          </p>
          {profile?.grade_levels && profile.grade_levels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.grade_levels.map((grade) => (
                <Badge key={grade} variant="secondary">{grade}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setCreateClassModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Class
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Assign Lesson
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Add Students
              </Button>
              <Link to="/teacher/gradebook">
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Gradebook
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Help Support
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Award className="w-4 h-4 mr-2" />
                PD Training
              </Button>
            </CardContent>
          </Card>

          {/* My Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                My Classes
                {classesLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No classes created yet</p>
                  <Button 
                    onClick={() => setCreateClassModalOpen(true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Class
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.map((classItem) => (
                    <div key={classItem.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {classItem.grade_level && (
                          <Badge variant="outline" className="text-xs">
                            Grade {classItem.grade_level}
                          </Badge>
                        )}
                        {classItem.subject && (
                          <Badge variant="secondary" className="text-xs">
                            {classItem.subject}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-4 h-4 mr-2 text-red-500" />
                Students Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm font-medium text-yellow-800">Alex Johnson</p>
                  <p className="text-xs text-yellow-600">Struggling with Module 3 - Forces</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <p className="text-sm font-medium text-red-800">Maria Santos</p>
                  <p className="text-xs text-red-600">Assignment overdue by 3 days</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm font-medium text-blue-800">David Chen</p>
                  <p className="text-xs text-blue-600">Completed ahead of schedule</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'assignment' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'alert' && (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    {activity.type === 'feedback' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Class Modal */}
      <CreateClassModal 
        open={createClassModalOpen}
        onOpenChange={setCreateClassModalOpen}
        onClassCreated={handleClassCreated}
        createClass={createClass}
      />
    </div>
  );
};

export default TeacherDashboard;
