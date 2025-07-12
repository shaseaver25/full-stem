import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserX, AlertTriangle } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';

const ImpersonationBanner = () => {
  const { 
    isImpersonating, 
    impersonatedUser, 
    impersonatedRole, 
    stopImpersonation 
  } = useImpersonation();

  if (!isImpersonating) return null;

  return (
    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span>
            🚨 IMPERSONATION MODE: Viewing as {impersonatedUser?.first_name} {impersonatedUser?.last_name}
          </span>
          <Badge variant="outline" className="bg-yellow-100">
            {impersonatedRole}
          </Badge>
        </div>
        <Button 
          onClick={stopImpersonation} 
          size="sm" 
          variant="outline"
          className="ml-2"
        >
          <UserX className="h-3 w-3 mr-1" />
          Exit
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ImpersonationBanner;