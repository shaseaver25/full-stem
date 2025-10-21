import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { seedDemoStatusUrl, seedDemoSeedUrl, seedDemoWipeUrl } from '@/integrations/supabase/functions';
import { Database, Users, GraduationCap, FileText, MessageCircle, Bell, BarChart3, Trash2, Zap, Lightbulb, Sprout } from 'lucide-react';
import { useCreateDemoClass } from '@/hooks/useCreateDemoClass';
import { useSeedDemoEnvironment } from '@/hooks/useSeedDemoEnvironment';

interface DemoDataCounts {
  teachers?: number;
  students?: number;
  parents?: number;
  classes?: number;
  assignments?: number;
  submissions?: number;
  announcements?: number;
  notifications?: number;
}

const DemoDataManagement = () => {
  const [loading, setLoading] = useState(false);
  const [lastSeeded, setLastSeeded] = useState<string | null>(null);
  const [dataCounts, setDataCounts] = useState<DemoDataCounts>({});
  const { toast } = useToast();
  const { mutate: createDemoClass, isPending: isCreatingClass } = useCreateDemoClass();
  const { mutate: seedDemoEnvironment, isPending: isSeedingEnvironment } = useSeedDemoEnvironment();

  const handleCheckStatus = async () => {
    try {
      const r = await fetch(seedDemoStatusUrl, { method: 'GET' });
      
      toast({
        title: "Status Check Complete",
        description: `Status: ${r.status} ${r.statusText}`
      });
      
      if (r.ok) {
        const data = await r.json();
        console.log('Status response:', data);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast({
        title: "Status Check Failed",
        description: error.message || "Failed to check demo status",
        variant: "destructive"
      });
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const jwt = (await supabase.auth.getSession())?.data.session?.access_token ?? '';
      const r = await fetch(seedDemoSeedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ tenantId: 'demo_full_stem' })
      });

      if (!r.ok) {
        throw new Error(`HTTP error! status: ${r.status}`);
      }

      const data = await r.json();

      setDataCounts(data.counts || {});
      setLastSeeded(data.timestamp);
      
      toast({
        title: "Demo Data Seeded Successfully",
        description: `Created ${data.counts?.students || 0} students, ${data.counts?.assignments || 0} assignments, and more!`
      });
    } catch (error) {
      console.error('Error seeding demo data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to seed demo data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWipeData = async () => {
    if (!confirm('Are you sure you want to wipe all demo data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const jwt = (await supabase.auth.getSession())?.data.session?.access_token ?? '';
      const r = await fetch(seedDemoWipeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ tenantId: 'demo_full_stem' })
      });

      if (!r.ok) {
        throw new Error(`HTTP error! status: ${r.status}`);
      }

      const data = await r.json();

      setDataCounts({});
      setLastSeeded(null);
      
      toast({
        title: "Demo Data Wiped",
        description: "All demo data has been removed successfully"
      });
    } catch (error) {
      console.error('Error wiping demo data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to wipe demo data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Demo Data Management</h2>
          <p className="text-muted-foreground">
            Create and manage demo data for "AI for Middle School Students" class
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Demo Mode
        </Badge>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Demo data creates a complete learning environment with students, assignments, and analytics.
          Perfect for demonstrations and testing the Read-Aloud and Translate features.
        </AlertDescription>
      </Alert>

      {/* Status Check Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleCheckStatus}
          variant="outline"
          className="w-auto"
        >
          Check Demo Status
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-500" />
              Seed Full Environment
            </CardTitle>
            <CardDescription>
              Complete demo setup with authentication-ready accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Creates:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Teacher: Dr. Alicia Navarro</li>
                <li>Student: Jordan Lee</li>
                <li>"AI Foundations" class</li>
                <li>2 Complete lessons</li>
                <li>2 Assignments with submissions</li>
                <li>Grades (90%, 92%)</li>
                <li>Goals & reflections</li>
                <li>Progress tracking</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => seedDemoEnvironment()} 
              disabled={isSeedingEnvironment}
              className="w-full"
              variant="default"
            >
              {isSeedingEnvironment ? 'Seeding...' : 'Seed Environment'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Create Demo Class
            </CardTitle>
            <CardDescription>
              Create a complete showcase class with teacher, student, lessons, and graded work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Creates:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>1 Teacher: Dr. Alicia Navarro</li>
                <li>1 Student: Jordan Lee</li>
                <li>"AI Foundations" class</li>
                <li>2 Interactive lessons</li>
                <li>2 Graded assignments (90%, 92%)</li>
                <li>Reflections & goals</li>
                <li>Progress tracking</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => createDemoClass()} 
              disabled={isCreatingClass}
              className="w-full"
              variant="default"
            >
              {isCreatingClass ? 'Creating...' : 'Create Demo Class'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Seed Demo Data
            </CardTitle>
            <CardDescription>
              Create a complete demo environment with students, assignments, and sample data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Creates:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>1 Demo teacher (Ms. Rivera)</li>
                <li>12 Students (grades 7-8)</li>
                <li>12 Parent contacts</li>
                <li>3 AI assignments with HTML content</li>
                <li>Sample submissions and grades</li>
                <li>Class announcements</li>
                <li>Parent notifications</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleSeedData} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Seeding...' : 'Seed Demo Data'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Wipe Demo Data
            </CardTitle>
            <CardDescription>
              Remove all demo data to start fresh
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Removes:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>All demo users and profiles</li>
                <li>Demo class and assignments</li>
                <li>All submissions and grades</li>
                <li>Messages and notifications</li>
                <li>Associated data safely</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleWipeData}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? 'Wiping...' : 'Wipe Demo Data'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Status Cards */}
      {Object.keys(dataCounts).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Demo Data Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{dataCounts.students || 0}</div>
                <p className="text-sm text-muted-foreground">Students</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <GraduationCap className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold">{dataCounts.teachers || 0}</div>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{dataCounts.assignments || 0}</div>
                <p className="text-sm text-muted-foreground">Assignments</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <MessageCircle className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold">{dataCounts.announcements || 0}</div>
                <p className="text-sm text-muted-foreground">Announcements</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Last Seeded Info */}
      {lastSeeded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Seeded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(lastSeeded).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Demo Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Demo Features to Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-primary">Read-Aloud Feature:</strong>
              <p className="text-muted-foreground">
                Open Assignment #1 and click the Play button to hear the AI content read aloud
              </p>
            </div>
            
            <div>
              <strong className="text-primary">Translate Feature:</strong>
              <p className="text-muted-foreground">
                Use the translate button on the Spanish sample text in Assignment #1
              </p>
            </div>
            
            <div>
              <strong className="text-primary">Grade Management:</strong>
              <p className="text-muted-foreground">
                View mixed submitted/missing assignments and use "Notify Parents" feature
              </p>
            </div>
            
            <div>
              <strong className="text-primary">Analytics:</strong>
              <p className="text-muted-foreground">
                Check the analytics dashboard for seeded usage data and engagement metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoDataManagement;