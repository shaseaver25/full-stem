import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Code, Users, FileText, Settings, Shield, Database, Plus, AlertTriangle, Zap, Activity, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import UserImpersonation from '@/components/developer/UserImpersonation';
import ImpersonationLogs from '@/components/developer/ImpersonationLogs';
import ImpersonationBanner from '@/components/developer/ImpersonationBanner';
import LessonTemplateManager from '@/components/admin/LessonTemplateManager';
import LessonViewModeToggle from '@/components/admin/LessonViewModeToggle';
import LessonComponentManager from '@/components/admin/LessonComponentManager';
import { FeatureTogglePanel } from '@/components/developer/FeatureTogglePanel';
import { PerformancePanel } from '@/components/developer/PerformancePanel';
import { ErrorLogViewer } from '@/components/developer/ErrorLogViewer';
import { SandboxDataManager } from '@/components/developer/SandboxDataManager';
import { useAuth } from '@/contexts/AuthContext';
import { MFARequiredBanner } from '@/components/system/MFARequiredBanner';
import { useMFAEnforcement } from '@/hooks/useMFAEnforcement';
import { getMode } from '@/utils/env';
import { CreateTestStudentsButton } from '@/components/admin/CreateTestStudentsButton';
import { AICostsPanel } from '@/components/developer/AICostsPanel';
import { MarkdownViewer } from '@/components/MarkdownViewer';

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const { requiresMFA, mfaEnabled } = useMFAEnforcement();
  
  // Environment safety check
  const mode = getMode();
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ImpersonationBanner />
      
      <div className="container mx-auto px-4 py-8">
        {requiresMFA && !mfaEnabled && <MFARequiredBanner role="developer" />}
        
        {/* Production Environment Warning */}
        {isProduction && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Production Environment</AlertTitle>
            <AlertDescription>
              You are accessing the production environment. All destructive operations are disabled for safety.
              Only read-only access and sandbox testing are available.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Code className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Developer Dashboard</h1>
                <Badge variant="destructive" className="bg-red-600">
                  Internal Use Only
                </Badge>
                {isProduction && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                    Production Mode - Read Only
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Full STEM Development Team - Curriculum Management & User Debugging
              </p>
              <p className="text-sm text-muted-foreground">
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

        <Tabs defaultValue="sandbox" className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="sandbox" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Sandbox
            </TabsTrigger>
            <TabsTrigger value="impersonation" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Impersonation
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="ai-costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              AI Costs
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports & Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sandbox" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Database className="h-4 w-4 text-blue-600" />
              <AlertTitle>Sandbox Testing Environment</AlertTitle>
              <AlertDescription>
                Use sandbox tables for testing without affecting production data. All changes are isolated and can be reset at any time.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Test Student Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create mock student accounts for testing the adaptive engine with different reading levels and languages.
                </p>
                <CreateTestStudentsButton />
              </CardContent>
            </Card>
            
            <SandboxDataManager isProduction={isProduction} />
          </TabsContent>

          <TabsContent value="impersonation" className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Developer Mode - Read-Only</AlertTitle>
              <AlertDescription>
                You can impersonate users for testing, but cannot modify production data.
                All actions are logged for security auditing.
              </AlertDescription>
            </Alert>
            <div className="grid md:grid-cols-2 gap-6">
              <UserImpersonation />
              <ImpersonationLogs />
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <FeatureTogglePanel />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformancePanel />
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <ErrorLogViewer />
          </TabsContent>

          <TabsContent value="ai-costs" className="space-y-4">
            <AICostsPanel />
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

          <TabsContent value="reports" className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <FileText className="h-4 w-4 text-blue-600" />
              <AlertTitle>Internal Documentation Hub</AlertTitle>
              <AlertDescription>
                Access comprehensive reports and technical documentation about the platform architecture and development processes.
              </AlertDescription>
            </Alert>
            
            <MarkdownViewer 
              filePath="/docs/DASHBOARD_ARCHITECTURE_REPORT.md"
              title="Dashboard Architecture Report"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperDashboard;