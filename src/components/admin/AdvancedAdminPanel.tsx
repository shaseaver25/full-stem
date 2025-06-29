import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, Users, Database, Activity, Download, Upload, 
  Settings, CheckCircle, XCircle, AlertTriangle, Clock,
  BarChart3, TrendingUp, Server, HardDrive
} from 'lucide-react';

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
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const { toast } = useToast();

  const [roleForm, setRoleForm] = useState({
    user_id: '',
    role: 'user' as 'admin' | 'moderator' | 'user'
  });

  const [backupForm, setBackupForm] = useState({
    backup_type: 'full'
  });

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

  const handleAssignRole = async () => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: roleForm.user_id,
          role: roleForm.role
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role assigned successfully"
      });

      setIsRoleModalOpen(false);
      setRoleForm({ user_id: '', role: 'user' });
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

  const handleStartBackup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('backup_logs')
        .insert({
          backup_type: backupForm.backup_type,
          status: 'in_progress',
          started_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Backup Started",
        description: `${backupForm.backup_type} backup has been initiated`
      });

      setIsBackupModalOpen(false);
      await fetchAdminData();

      // Simulate backup completion (in real app, this would be handled by a background job)
      setTimeout(async () => {
        await supabase
          .from('backup_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            file_path: `/backups/${backupForm.backup_type}_${Date.now()}.sql`,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading admin panel...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Advanced Administration</h1>
        <div className="flex space-x-2">
          <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Shield className="mr-2 h-4 w-4" />
                Manage Roles
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign User Role</DialogTitle>
                <DialogDescription>
                  Grant administrative privileges to users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    value={roleForm.user_id}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, user_id: e.target.value }))}
                    placeholder="Enter user UUID"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={roleForm.role}
                    onValueChange={(value: 'admin' | 'moderator' | 'user') => setRoleForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignRole}>
                    Assign Role
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isBackupModalOpen} onOpenChange={setIsBackupModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Backup Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Backup</DialogTitle>
                <DialogDescription>
                  Create a backup of your system data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Backup Type</Label>
                  <Select
                    value={backupForm.backup_type}
                    onValueChange={(value) => setBackupForm(prev => ({ ...prev, backup_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Backup</SelectItem>
                      <SelectItem value="incremental">Incremental Backup</SelectItem>
                      <SelectItem value="content_only">Content Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsBackupModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStartBackup}>
                    <Download className="mr-2 h-4 w-4" />
                    Start Backup
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Role Management
              </CardTitle>
              <CardDescription>
                Manage user roles and administrative privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRoles.map((userRole) => (
                  <Card key={userRole.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{userRole.user_name}</h4>
                          <p className="text-sm text-muted-foreground">{userRole.user_email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getRoleColor(userRole.role)}>
                            {userRole.role}
                          </Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveRole(userRole.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Permission Matrix
              </CardTitle>
              <CardDescription>
                View and manage granular permissions for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {['admin', 'moderator', 'user'].map((role) => (
                  <Card key={role}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{role}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {permissions
                          .filter(p => p.role === role)
                          .map((permission) => (
                            <Badge key={permission.id} variant="outline">
                              {permission.permission.replace('_', ' ')}
                            </Badge>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Backup Management
              </CardTitle>
              <CardDescription>
                Monitor and manage system backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupLogs.map((backup) => (
                  <Card key={backup.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(backup.status)}
                          <div>
                            <h4 className="font-medium capitalize">
                              {backup.backup_type} Backup
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Started: {new Date(backup.started_at).toLocaleString()}
                            </p>
                            {backup.completed_at && (
                              <p className="text-sm text-muted-foreground">
                                Completed: {new Date(backup.completed_at).toLocaleString()}
                              </p>
                            )}
                            {backup.file_size && (
                              <p className="text-sm text-muted-foreground">
                                Size: {formatFileSize(backup.file_size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={backup.status === 'completed' ? 'default' : 
                                        backup.status === 'failed' ? 'destructive' : 'secondary'}>
                            {backup.status}
                          </Badge>
                          {backup.status === 'completed' && backup.file_path && (
                            <Button size="sm" variant="outline">
                              <Download className="mr-2 h-3 w-3" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                      {backup.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-600">{backup.error_message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Performance Monitoring
              </CardTitle>
              <CardDescription>
                System performance metrics and monitoring data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {performanceMetrics.map((metric) => (
                  <Card key={metric.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{metric.metric_name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {metric.metric_type.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {metric.value.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {metric.unit}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {new Date(metric.recorded_at).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAdminPanel;
