import React, { useState } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Eye, Lock, Unlock, Timer, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SuperAdminToolbar: React.FC = () => {
  const { 
    isSuperAdmin, 
    session, 
    readOnlyMode, 
    enableWriteOverride, 
    disableWriteOverride, 
    setViewAs 
  } = useSuperAdmin();

  const [writeOverrideDialogOpen, setWriteOverrideDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [minutes, setMinutes] = useState(15);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Update countdown timer
  React.useEffect(() => {
    if (session.writeOverrideEnabled && session.writeOverrideExpiresAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = session.writeOverrideExpiresAt!.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining('Expired');
          disableWriteOverride();
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session.writeOverrideEnabled, session.writeOverrideExpiresAt, disableWriteOverride]);

  if (!isSuperAdmin) return null;

  const handleEnableWriteOverride = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "You must provide a reason for enabling write access",
        variant: "destructive"
      });
      return;
    }

    await enableWriteOverride(reason.trim(), minutes);
    setWriteOverrideDialogOpen(false);
    setReason('');
  };

  const handleViewAsChange = (value: string) => {
    if (value === 'none') {
      setViewAs();
    } else {
      setViewAs(value);
    }
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="h-5 w-5" />
          Super Admin Controls
          <Badge variant="destructive" className="ml-auto">
            ELEVATED ACCESS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View As Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">View As Role</Label>
            <Select value={session.viewAsRole || 'none'} onValueChange={handleViewAsChange}>
              <SelectTrigger className="bg-white/80">
                <SelectValue placeholder="Select role to view as..." />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md z-50">
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Super Admin (Normal View)
                  </div>
                </SelectItem>
                <SelectItem value="student">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View as Student
                  </div>
                </SelectItem>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View as Teacher
                  </div>
                </SelectItem>
                <SelectItem value="school_admin">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View as School Admin
                  </div>
                </SelectItem>
                <SelectItem value="district_admin">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View as District Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Tenant Context</Label>
            <Select value={session.viewAsTenantId || 'global'} onValueChange={(value) => {
              setViewAs(session.viewAsRole, value === 'global' ? undefined : value);
            }}>
              <SelectTrigger className="bg-white/80">
                <SelectValue placeholder="Select tenant..." />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md z-50">
                <SelectItem value="global">Global (All Tenants)</SelectItem>
                <SelectItem value="demo">Demo Tenant</SelectItem>
                {/* Add more tenant options as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Write Override Status */}
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border">
          <div className="flex items-center gap-3">
            {readOnlyMode ? (
              <>
                <Lock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Read-Only Mode</p>
                  <p className="text-sm text-green-600">
                    Write operations are blocked for safety
                  </p>
                </div>
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Write Override Active</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4" />
                    <span className="text-red-600">Expires in: {timeRemaining}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {readOnlyMode ? (
              <Button 
                onClick={() => setWriteOverrideDialogOpen(true)}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                Request Write Access
              </Button>
            ) : (
              <Button 
                onClick={disableWriteOverride}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Disable Write Access
              </Button>
            )}
          </div>
        </div>

        {/* Current Context Display */}
        {(session.viewAsRole || session.viewAsTenantId) && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Current Context:</strong> {' '}
              {session.viewAsRole && `Viewing as ${session.viewAsRole}`}
              {session.viewAsRole && session.viewAsTenantId && ' • '}
              {session.viewAsTenantId && `Tenant: ${session.viewAsTenantId}`}
            </p>
          </div>
        )}
      </CardContent>

      {/* Write Override Confirmation Dialog */}
      <Dialog open={writeOverrideDialogOpen} onOpenChange={setWriteOverrideDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Enable Write Override
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-800 mb-2">Security Warning</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All actions will be audited and logged</li>
                <li>• Write access will automatically expire</li>
                <li>• Use only for necessary administrative tasks</li>
                <li>• Context: {session.viewAsRole || 'Super Admin'} view</li>
              </ul>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Required)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why write access is needed (e.g., 'Fix critical bug affecting production users')"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="minutes">Duration (Minutes)</Label>
              <Input
                id="minutes"
                type="number"
                min="1"
                max="60"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 15)}
                className="mt-1 w-24"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setWriteOverrideDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEnableWriteOverride}
                variant="destructive"
                disabled={!reason.trim()}
              >
                Enable Write Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};