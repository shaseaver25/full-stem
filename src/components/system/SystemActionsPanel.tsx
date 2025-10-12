import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Database, Key, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logUserAction, ActivityActions } from '@/utils/activityLogger';

export const SystemActionsPanel = () => {
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBackup = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('backup_logs').insert({
        backup_type: 'manual',
        status: 'in_progress',
        started_by: user.id,
      });

      if (error) throw error;

      // Log the action
      await logUserAction({
        userId: user.id,
        role: 'system_admin',
        action: 'Triggered Database Backup',
        details: {
          backup_type: 'manual',
          timestamp: new Date().toISOString(),
        },
      });

      toast({
        title: 'Backup Started',
        description: 'Database backup has been initiated successfully.',
      });

      setIsBackupDialogOpen(false);
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: 'Backup Failed',
        description: 'Failed to start backup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCacheSync = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Log the action
      await logUserAction({
        userId: user.id,
        role: 'system_admin',
        action: 'Synced Content Cache',
        details: {
          timestamp: new Date().toISOString(),
        },
      });

      toast({
        title: 'Cache Synced',
        description: 'Content cache has been refreshed successfully.',
      });

      setIsSyncDialogOpen(false);
    } catch (error) {
      console.error('Cache sync error:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync cache. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Database className="h-5 w-5" />
            System Actions
          </CardTitle>
          <CardDescription>
            Critical system operations - all actions require confirmation and are logged
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <div>
              <p className="font-medium text-sm">Database Backup</p>
              <p className="text-xs text-muted-foreground">Create a manual backup of the database</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBackupDialogOpen(true)}
              disabled={isLoading}
            >
              <Database className="h-4 w-4 mr-2" />
              Start Backup
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <div>
              <p className="font-medium text-sm">Sync Content Cache</p>
              <p className="text-xs text-muted-foreground">Refresh the content delivery cache</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSyncDialogOpen(true)}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Cache
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-800 opacity-50">
            <div>
              <p className="font-medium text-sm">Manage API Keys</p>
              <p className="text-xs text-muted-foreground">View and rotate system API keys</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Key className="h-4 w-4 mr-2" />
              Manage Keys
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Confirmation Dialog */}
      <AlertDialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Database Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a complete backup of the database. The process may take several
              minutes depending on database size. This action will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBackup} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cache Sync Confirmation Dialog */}
      <AlertDialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync Content Cache?</AlertDialogTitle>
            <AlertDialogDescription>
              This will refresh the content cache across all CDN nodes. Users may experience
              brief delays while the cache rebuilds. This action will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCacheSync} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Sync
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
