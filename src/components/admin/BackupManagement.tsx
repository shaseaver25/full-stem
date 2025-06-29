
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Download, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

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

interface BackupManagementProps {
  backupLogs: BackupLog[];
  onStartBackup: (backupType: string) => Promise<void>;
}

const BackupManagement: React.FC<BackupManagementProps> = ({ backupLogs, onStartBackup }) => {
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupForm, setBackupForm] = useState({
    backup_type: 'full'
  });

  const handleStartBackup = async () => {
    await onStartBackup(backupForm.backup_type);
    setIsBackupModalOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="flex justify-end mb-4">
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
    </>
  );
};

export default BackupManagement;
