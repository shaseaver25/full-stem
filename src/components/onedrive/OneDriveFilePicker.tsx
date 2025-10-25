import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FolderOpen, Loader2 } from 'lucide-react';
import { getValidOneDriveToken, hasOneDriveAccess } from '@/utils/oneDrive';
import { OneDriveReauthorization } from './OneDriveReauthorization';
import { useOneDriveAuth } from '@/hooks/useOneDriveAuth';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface OneDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webUrl: string;
}

interface OneDriveFilePickerProps {
  onFileSelected: (file: OneDriveFile) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function OneDriveFilePicker({ 
  onFileSelected, 
  disabled = false,
  variant = 'outline',
  size = 'default'
}: OneDriveFilePickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { signInWithMicrosoft } = useOneDriveAuth();

  useEffect(() => {
    // Check if user has OneDrive access
    const checkAccess = async () => {
      const hasAccess = await hasOneDriveAccess();
      setNeedsAuth(!hasAccess);
    };

    checkAccess();

    // Load OneDrive Picker SDK
    const loadOneDrivePicker = () => {
      if (window.OneDrive) {
        setPickerLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.live.net/v7.2/OneDrive.js';
      script.onload = () => {
        console.log('✅ OneDrive Picker API loaded');
        setPickerLoaded(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load OneDrive Picker API');
        toast({
          title: 'Error',
          description: 'Failed to load OneDrive picker',
          variant: 'destructive'
        });
      };
      document.body.appendChild(script);
    };

    loadOneDrivePicker();
  }, [toast]);

  const handleConnectOneDrive = async () => {
    setIsConnecting(true);
    console.log('🔗 Connecting to OneDrive...');
    
    const result = await signInWithMicrosoft();
    
    setIsConnecting(false);
    
    if (result.success) {
      setShowConnectDialog(false);
      toast({
        title: "Success",
        description: "OneDrive connection initiated. You'll be redirected to complete the authorization.",
      });
    }
  };

  const openPicker = async () => {
    if (!pickerLoaded) {
      toast({
        title: 'Loading',
        description: 'OneDrive Picker is still loading...',
      });
      return;
    }

    // Check if user has valid OneDrive token
    console.log('🔍 Checking OneDrive access before opening picker...');
    const hasAccess = await hasOneDriveAccess();
    
    if (!hasAccess) {
      console.log('⚠️ No OneDrive access detected, prompting for connection...');
      setShowConnectDialog(true);
      return;
    }

    console.log('✅ OneDrive access confirmed, proceeding with picker...');
    setIsLoading(true);

    try {
      console.log('🔍 Getting OneDrive access token...');
      const accessToken = await getValidOneDriveToken();

      if (!accessToken) {
        console.error('❌ No valid access token available');
        setShowConnectDialog(true);
        setIsLoading(false);
        return;
      }

      console.log('✅ Token acquired, opening picker...');

      // OneDrive Picker options
      const pickerOptions = {
        clientId: 'YOUR_AZURE_CLIENT_ID', // This should be configured in env
        action: 'share',
        multiSelect: false,
        advanced: {
          accessToken: accessToken,
          redirectUri: `${window.location.origin}/auth/callback`,
          filter: '.docx,.xlsx,.pptx,.pdf,.jpg,.jpeg,.png,.mp4'
        },
        success: (files: any) => {
          console.log('📎 File selected:', files.value[0]);
          const file = files.value[0];
          
          const oneDriveFile: OneDriveFile = {
            id: file.id,
            name: file.name,
            mimeType: file.file?.mimeType || 'application/octet-stream',
            webUrl: file.webUrl
          };

          onFileSelected(oneDriveFile);

          toast({
            title: 'File Attached',
            description: `${file.name} has been attached from OneDrive.`,
          });
          setIsLoading(false);
        },
        cancel: () => {
          console.log('⚠️ Picker cancelled by user');
          setIsLoading(false);
        },
        error: (error: any) => {
          console.error('❌ Picker error:', error);
          toast({
            title: 'Error',
            description: 'Failed to select file from OneDrive',
            variant: 'destructive'
          });
          setIsLoading(false);
        }
      };

      window.OneDrive.open(pickerOptions);
    } catch (error) {
      console.error('❌ Error opening picker:', error);
      
      let errorMessage = 'Failed to open OneDrive picker. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'OneDrive access denied. Please sign in again with Microsoft to grant permissions.';
          setNeedsAuth(true);
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  if (needsAuth) {
    return <OneDriveReauthorization onSuccess={() => setNeedsAuth(false)} />;
  }

  return (
    <>
      <div className="space-y-2">
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={openPicker}
          disabled={disabled || isLoading || !pickerLoaded}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <FolderOpen className="mr-2 h-4 w-4" />
              Attach from OneDrive
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          You can use your school or personal Microsoft account to attach files.
        </p>
      </div>

      {/* OneDrive Connection Dialog */}
      <AlertDialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect to OneDrive</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You're not currently connected to OneDrive.</p>
              <p>Sign in with your Microsoft account to link your OneDrive and attach files to lessons.</p>
              <p className="text-xs text-muted-foreground">
                This works with both school and personal Microsoft accounts.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConnectDialog(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnectOneDrive}
              disabled={isConnecting}
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect OneDrive'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Type declaration for OneDrive Picker API
declare global {
  interface Window {
    OneDrive: {
      open: (options: any) => void;
    };
  }
}
