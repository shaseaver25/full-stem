import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useOneDriveAuth } from '@/hooks/useOneDriveAuth';
import { useState } from 'react';

interface OneDriveReauthorizationProps {
  onSuccess?: () => void;
}

export function OneDriveReauthorization({ onSuccess }: OneDriveReauthorizationProps) {
  const { signInWithMicrosoft } = useOneDriveAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleReauthorize = async () => {
    setIsLoading(true);
    const result = await signInWithMicrosoft();
    setIsLoading(false);
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Alert variant="destructive" className="border-l-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium">OneDrive Access Required</p>
          <p className="text-sm mt-1">
            You need to authorize OneDrive access to attach files. This grants permission to read and select files from your OneDrive.
          </p>
        </div>
        <Button
          onClick={handleReauthorize}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Authorize OneDrive'
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
