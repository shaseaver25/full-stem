
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import AdminSiteOverview from '@/components/admin/AdminSiteOverview';
import AdminClassManagement from '@/components/admin/AdminClassManagement';
import AdminTeacherSupport from '@/components/admin/AdminTeacherSupport';
import AdminPilotTracking from '@/components/admin/AdminPilotTracking';
import AdminReports from '@/components/admin/AdminReports';
import AdminInsights from '@/components/admin/AdminInsights';
import AdminNotifications from '@/components/admin/AdminNotifications';
import ClassPublishingPanel from '@/components/admin/ClassPublishingPanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your educational platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="pilot">Pilot</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminSiteOverview />
          </TabsContent>

          <TabsContent value="classes">
            <AdminClassManagement />
          </TabsContent>

          <TabsContent value="publishing">
            <ClassPublishingPanel />
          </TabsContent>

          <TabsContent value="teachers">
            <AdminTeacherSupport />
          </TabsContent>

          <TabsContent value="pilot">
            <AdminPilotTracking />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports />
          </TabsContent>

          <TabsContent value="insights">
            <AdminInsights />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
