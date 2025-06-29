
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  user_email: string;
  user_name: string;
}

interface UserRoleManagementProps {
  userRoles: UserRole[];
  onAssignRole: (roleData: { user_id: string; role: 'admin' | 'moderator' | 'user' }) => Promise<void>;
  onRemoveRole: (roleId: string) => Promise<void>;
}

const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  userRoles,
  onAssignRole,
  onRemoveRole
}) => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    user_id: '',
    role: 'user' as 'admin' | 'moderator' | 'user'
  });

  const handleAssignRole = async () => {
    await onAssignRole(roleForm);
    setIsRoleModalOpen(false);
    setRoleForm({ user_id: '', role: 'user' });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
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
      </div>

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
                        onClick={() => onRemoveRole(userRole.id)}
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
    </>
  );
};

export default UserRoleManagement;
