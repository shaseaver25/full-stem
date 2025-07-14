
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import AdminSiteOverview from '@/components/admin/AdminSiteOverview';
import AdminClassManagement from '@/components/admin/AdminClassManagement';
import AdminTeacherSupport from '@/components/admin/AdminTeacherSupport';
import AdminPilotTracking from '@/components/admin/AdminPilotTracking';
import AdminReports from '@/components/admin/AdminReports';
import AdminInsights from '@/components/admin/AdminInsights';
import AdminNotifications from '@/components/admin/AdminNotifications';
import ClassPublishingPanel from '@/components/admin/ClassPublishingPanel';
import { ClassPublisher } from '@/components/admin/ClassPublisher';
import ContentLibrary from '@/components/content/ContentLibrary';
import UserRoleManagement from '@/components/admin/UserRoleManagement';
import AdvancedAdminPanel from '@/components/admin/AdvancedAdminPanel';
import { Plus } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your educational platform</p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/course-editor">
                <Button variant="outline">
                  Course Editor
                </Button>
              </Link>
              <Link to="/admin/build-class">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Build Class
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminSiteOverview />
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <ClassPublisher />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentLibrary />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-gray-600">User role management features coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdminReports />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdvancedAdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
