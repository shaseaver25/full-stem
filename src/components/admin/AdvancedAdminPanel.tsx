
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UserRoleManagement from './UserRoleManagement';
import PermissionsMatrix from './PermissionsMatrix';
import BackupManagement from './BackupManagement';
import PerformanceMonitoring from './PerformanceMonitoring';
import LessonTemplateManager from './LessonTemplateManager';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  user_email: string;
  user_name: string;
}

interface Permission {
  id: string;
  role: string;
  permission: string;
}

interface BackupLog {
  id: string;
  backup_type: string;
  status: string;
  file_path: string;
  file_size: number;
  started_at: string;
  completed_at: string;
  error_message: string;
}

interface PerformanceMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  value: number;
  unit: string;
  recorded_at: string;
}

const AdvancedAdminPanel = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch user roles with profile information
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('id, user_id, role');

      if (rolesData) {
        // Get profile info separately to avoid relation issues
        const userRolesData = await Promise.all(
          rolesData.map(async (role) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', role.user_id)
              .single();

            return {
              id: role.id,
              user_id: role.user_id,
              role: role.role,
              user_email: profile?.email || 'Unknown',
              user_name: profile?.full_name || 'Unknown User'
            };
          })
        );

        setUserRoles(userRolesData);
      }

      // Fetch permissions
      const { data: permissionsData } = await supabase
        .from('user_role_permissions')
        .select('*');

      setPermissions(permissionsData || []);

      // Fetch backup logs
      const { data: backupData } = await supabase
        .from('backup_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      setBackupLogs(backupData || []);

      // Fetch performance metrics
      const { data: metricsData } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(20);

      setPerformanceMetrics(metricsData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (roleData: { user_id: string; role: 'admin' | 'moderator' | 'user' }) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: roleData.user_id,
          role: roleData.role
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role assigned successfully"
      });

      await fetchAdminData();

    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully"
      });

      await fetchAdminData();

    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive"
      });
    }
  };

  const handleStartBackup = async (backupType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('backup_logs')
        .insert({
          backup_type: backupType,
          status: 'in_progress',
          started_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Backup Started",
        description: `${backupType} backup has been initiated`
      });

      await fetchAdminData();

      // Simulate backup completion (in real app, this would be handled by a background job)
      setTimeout(async () => {
        await supabase
          .from('backup_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            file_path: `/backups/${backupType}_${Date.now()}.sql`,
            file_size: Math.floor(Math.random() * 1000000) + 100000
          })
          .eq('status', 'in_progress');

        await fetchAdminData();
        toast({
          title: "Backup Completed",
          description: "Backup has been completed successfully"
        });
      }, 5000);

    } catch (error) {
      console.error('Error starting backup:', error);
      toast({
        title: "Error",
        description: "Failed to start backup",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading admin panel...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Advanced Administration</h1>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="templates">Lesson Templates</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <UserRoleManagement 
            userRoles={userRoles}
            onAssignRole={handleAssignRole}
            onRemoveRole={handleRemoveRole}
          />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionsMatrix permissions={permissions} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <LessonTemplateManager />
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <BackupManagement 
            backupLogs={backupLogs}
            onStartBackup={handleStartBackup}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMonitoring performanceMetrics={performanceMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAdminPanel;
