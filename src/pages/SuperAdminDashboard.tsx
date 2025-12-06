import React from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { SuperAdminToolbar } from '@/components/admin/SuperAdminToolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, Users, Activity, FileText, Settings } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';

const SuperAdminDashboard: React.FC = () => {
  const { isSuperAdmin, loading } = useSuperAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
              Super Admin
            </h1>
            <p className="text-sm text-gray-600 hidden md:block">
              System-wide administration and oversight
            </p>
          </div>
        </div>
        <Badge variant="destructive" className="px-2 py-1 text-xs w-fit">
          ELEVATED ACCESS
        </Badge>
      </div>

      {/* Super Admin Toolbar */}
      <SuperAdminToolbar />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 md:grid md:grid-cols-6 w-full bg-white">
          <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
            <Activity className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
            <Database className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
            <FileText className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="tenants" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
            <Shield className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Tenants</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
            <Settings className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  +3 new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Including you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Actions Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Warning
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage users across all tenants. Use the toolbar above to switch contexts.
              </p>
              <Button disabled className="opacity-50">
                View Users (Demo Mode)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Direct database access and management tools.
              </p>
              <Button disabled className="opacity-50">
                Database Console (Demo Mode)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All super admin actions are logged here for security and compliance.
              </p>
              <Button disabled className="opacity-50">
                View Audit Logs (Demo Mode)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage multi-tenant configurations and settings.
              </p>
              <Button disabled className="opacity-50">
                Manage Tenants (Demo Mode)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Global system configuration and feature flags.
              </p>
              <Button disabled className="opacity-50">
                System Settings (Demo Mode)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;