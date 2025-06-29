
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface Permission {
  id: string;
  role: string;
  permission: string;
}

interface PermissionsMatrixProps {
  permissions: Permission[];
}

const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({ permissions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Permission Matrix
        </CardTitle>
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
  );
};

export default PermissionsMatrix;
