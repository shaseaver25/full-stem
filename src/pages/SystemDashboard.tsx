import { useSystemAdmin } from '@/hooks/useSystemAdmin';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { SystemModeBadge } from '@/components/system/SystemModeBadge';
import { SystemOverview } from '@/components/system/SystemOverview';
import { SystemActionsPanel } from '@/components/system/SystemActionsPanel';
import { SystemHealthMonitor } from '@/components/system/SystemHealthMonitor';
import { ActivityLogCard } from '@/components/activity/ActivityLogCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Activity, Database, Settings, Heart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MFARequiredBanner } from '@/components/system/MFARequiredBanner';

const SystemDashboard = () => {
  const { isSystemAdmin, requiresMFA, isLoading } = useSystemAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-8 max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isSystemAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header with System Mode Badge */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8" />
              System Administration
            </h1>
            <p className="text-muted-foreground mt-2">
              Platform oversight, monitoring, and system configuration
            </p>
          </div>
          <SystemModeBadge />
        </div>

        {/* MFA Warning */}
        {requiresMFA && <MFARequiredBanner role="system_admin" />}

        {/* Main Content Tabs */}
        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Actions
            </TabsTrigger>
            <TabsTrigger value="developer" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Developer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-6">
            <SystemHealthMonitor />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityLogCard 
              title="Platform-Wide Activity Log" 
              showRoleFilter={true}
              maxItems={50}
            />
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <SystemActionsPanel />
          </TabsContent>

          <TabsContent value="developer" className="space-y-6">
            <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                  <Shield className="h-5 w-5" />
                  Developer Mode
                </CardTitle>
                <CardDescription>
                  Advanced system configuration and debugging tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium mb-2">Feature Toggles</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable experimental features across the platform
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium mb-2">Environment Variables</h4>
                    <p className="text-sm text-muted-foreground">
                      View system configuration (read-only for security)
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium mb-2">RLS Policy Audit</h4>
                    <p className="text-sm text-muted-foreground">
                      Review and validate Row-Level Security policies
                    </p>
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

export default SystemDashboard;
