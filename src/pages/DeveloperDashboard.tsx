import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Users, FileText, Settings, Shield, Database, Plus } from 'lucide-react';
import Header from '@/components/Header';
import UserImpersonation from '@/components/developer/UserImpersonation';
import ImpersonationLogs from '@/components/developer/ImpersonationLogs';
import ImpersonationBanner from '@/components/developer/ImpersonationBanner';
import LessonTemplateManager from '@/components/admin/LessonTemplateManager';
import LessonViewModeToggle from '@/components/admin/LessonViewModeToggle';
import LessonComponentManager from '@/components/admin/LessonComponentManager';
import { useAuth } from '@/contexts/AuthContext';

const DeveloperDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ImpersonationBanner />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Code className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Developer Dashboard</h1>
                <Badge variant="destructive" className="bg-red-600">
                  Internal Use Only
                </Badge>
              </div>
              <p className="text-gray-600">
                Full STEM Development Team - Curriculum Management & User Debugging
              </p>
              <p className="text-sm text-gray-500">
                Logged in as: {user?.email}
              </p>
            </div>
            <Link to="/admin/build-class">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Build Class
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="impersonation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="impersonation" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Impersonation
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="impersonation" className="grid md:grid-cols-2 gap-6">
            <UserImpersonation />
            <ImpersonationLogs />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-6">
              <LessonTemplateManager />
              <LessonViewModeToggle />
              <LessonComponentManager />
              
              <div className="grid md:grid-cols-2 gap-6">

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Translation & Accessibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage language settings and accessibility features.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Languages Supported</span>
                      <Badge variant="outline">15</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Reading Levels</span>
                      <Badge variant="outline">3-8</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Preview System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Test personalization logic and preview content changes.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Read-only access to user dashboards. Use impersonation mode to view from user perspectives.
                </p>
                <div className="mt-4 grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-medium">Teachers</h3>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-medium">Students</h3>
                    <p className="text-2xl font-bold text-green-600">0</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-medium">Parents</h3>
                    <p className="text-2xl font-bold text-purple-600">0</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-medium">Schools</h3>
                    <p className="text-2xl font-bold text-orange-600">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Database health monitoring and management tools.
                </p>
                <Badge variant="secondary">Admin Tools Coming Soon</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <ImpersonationLogs />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Environment</h3>
                      <p className="text-sm text-gray-600">Current environment settings</p>
                    </div>
                    <Badge variant="outline">Development</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">2FA Status</h3>
                      <p className="text-sm text-gray-600">Two-factor authentication</p>
                    </div>
                    <Badge variant="destructive">Disabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">IP Restrictions</h3>
                      <p className="text-sm text-gray-600">Access control by IP address</p>
                    </div>
                    <Badge variant="secondary">Not Configured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperDashboard;