
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  School, 
  Users, 
  BookOpen, 
  FileText, 
  Plus, 
  Bell, 
  HeadphonesIcon,
  BarChart3,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSiteOverview from '@/components/admin/AdminSiteOverview';
import AdminClassManagement from '@/components/admin/AdminClassManagement';
import AdminReports from '@/components/admin/AdminReports';
import AdminNotifications from '@/components/admin/AdminNotifications';
import AdminInsights from '@/components/admin/AdminInsights';
import AdminTeacherSupport from '@/components/admin/AdminTeacherSupport';
import AdminPilotTracking from '@/components/admin/AdminPilotTracking';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <School className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Full STEM Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <HeadphonesIcon className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Site Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="support">Teacher Support</TabsTrigger>
            <TabsTrigger value="pilot">Pilot Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminSiteOverview />
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <AdminClassManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <AdminReports />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AdminInsights />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <AdminNotifications />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <AdminTeacherSupport />
          </TabsContent>

          <TabsContent value="pilot" className="space-y-6">
            <AdminPilotTracking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
