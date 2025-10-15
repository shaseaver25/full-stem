import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface DriveReauthorizationProps {
  onSuccess?: () => void;
}

export function DriveReauthorization({ onSuccess }: DriveReauthorizationProps) {
  const [isReauthorizing, setIsReauthorizing] = useState(false);
  const { toast } = useToast();

  const handleReauthorize = async () => {
    setIsReauthorizing(true);

    try {
      console.log('🔄 Starting Drive reauthorization...');
      console.log('📋 Requesting scopes: email profile openid https://www.googleapis.com/auth/drive.file');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'email profile openid https://www.googleapis.com/auth/drive.file',
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent', // Force consent screen to ensure Drive scope is granted
          },
        },
      });

      if (error) {
        console.error('❌ OAuth error:', error);
        toast({
          title: 'Error',
          description: 'Failed to initiate reauthorization. Please try again.',
          variant: 'destructive'
        });
      } else {
        console.log('✅ Redirecting to Google for authorization...');
        console.log('💡 Make sure to grant Drive file access when prompted');
        toast({
          title: 'Redirecting',
          description: 'Redirecting to Google for reauthorization...',
        });
        
        // Call success callback if provided
        onSuccess?.();
      }
    } catch (error) {
      console.error('❌ Reauthorization error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsReauthorizing(false);
    }
  };

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Google Drive Access Required</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Your Google Drive access has expired or is missing. Please reauthorize 
          to continue using Drive features.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReauthorize}
          disabled={isReauthorizing}
          className="mt-2"
        >
          {isReauthorizing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reauthorize Google Drive
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
