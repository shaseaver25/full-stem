import React from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, Unlock, Timer, AlertTriangle } from 'lucide-react';

export const SuperAdminBanner: React.FC = () => {
  const { isSuperAdmin, session, readOnlyMode } = useSuperAdmin();

  if (!isSuperAdmin) return null;

  const isWriteOverrideActive = session.writeOverrideEnabled;
  const isViewingAs = session.viewAsRole || session.viewAsTenantId;

  return (
    <div className="space-y-2">
      {/* Main Super Admin Badge */}
      <div className="flex justify-between items-center bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-orange-500 p-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-orange-600" />
          <Badge variant="destructive" className="text-xs">
            ELEVATED: SUPER ADMIN
          </Badge>
          
          {isViewingAs && (
            <div className="flex items-center gap-1 ml-2">
              <Eye className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">
                Viewing as {session.viewAsRole || 'Different Tenant'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {readOnlyMode ? (
            <Badge variant="secondary" className="text-xs">
              Read-Only
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs animate-pulse">
              Write Override Active
            </Badge>
          )}
        </div>
      </div>

      {/* Write Override Warning Banner */}
      {isWriteOverrideActive && (
        <Alert className="border-red-300 bg-gradient-to-r from-red-50 to-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Unlock className="h-4 w-4" />
                <span className="font-semibold">
                  Write Override Active - All actions are being audited
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Timer className="h-3 w-3" />
                <span>
                  {session.writeOverrideExpiresAt && 
                    `Expires: ${session.writeOverrideExpiresAt.toLocaleTimeString()}`
                  }
                </span>
              </div>
            </div>
            {session.reason && (
              <div className="mt-2 text-sm">
                <strong>Reason:</strong> {session.reason}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Watermark component for persistent visual indicator
export const SuperAdminWatermark: React.FC = () => {
  const { isSuperAdmin, readOnlyMode } = useSuperAdmin();

  if (!isSuperAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className={`
        px-3 py-1 rounded-full text-xs font-bold shadow-lg
        ${!readOnlyMode 
          ? 'bg-red-600 text-white animate-pulse' 
          : 'bg-orange-500 text-white'
        }
      `}>
        {!readOnlyMode ? 'SUPER ADMIN - WRITE MODE' : 'SUPER ADMIN'}
      </div>
    </div>
  );
};