import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FolderOpen, Loader2 } from 'lucide-react';
import { getValidDriveToken, hasDriveAccess } from '@/utils/googleDrive';
import { DriveReauthorization } from './DriveReauthorization';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
}

interface DriveFilePickerProps {
  onFileSelected: (file: DriveFile) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export function DriveFilePicker({ 
  onFileSelected, 
  disabled = false,
  variant = 'outline',
  size = 'default'
}: DriveFilePickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has Drive access
    const checkAccess = async () => {
      const hasAccess = await hasDriveAccess();
      setNeedsAuth(!hasAccess);
    };

    checkAccess();

    // Load Google Picker API
    const loadGooglePicker = () => {
      if (window.google?.picker) {
        setPickerLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('picker', () => {
          console.log('✅ Google Picker API loaded');
          setPickerLoaded(true);
        });
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Picker API');
        toast({
          title: 'Error',
          description: 'Failed to load Google Drive picker',
          variant: 'destructive'
        });
      };
      document.body.appendChild(script);
    };

    loadGooglePicker();
  }, [toast]);

  const openPicker = async () => {
    if (!pickerLoaded) {
      toast({
        title: 'Loading',
        description: 'Google Picker is still loading...',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 Getting Drive access token...');
      const accessToken = await getValidDriveToken();

      if (!accessToken) {
        setNeedsAuth(true);
        toast({
          title: 'Authentication Required',
          description: 'Please sign in with Google to access Drive files.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Token acquired, opening picker...');

      // Create picker
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .addView(window.google.picker.ViewId.DOCS_IMAGES)
        .addView(window.google.picker.ViewId.DOCS_VIDEOS)
        .addView(window.google.picker.ViewId.SPREADSHEETS)
        .addView(window.google.picker.ViewId.PRESENTATIONS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const file = data.docs[0];
            console.log('📎 File selected:', file);

            const driveFile: DriveFile = {
              id: file.id,
              name: file.name,
              mimeType: file.mimeType,
              url: file.url
            };

            onFileSelected(driveFile);

            toast({
              title: 'File Attached',
              description: `${file.name} has been attached from Google Drive.`,
            });
          } else if (data.action === window.google.picker.Action.CANCEL) {
            console.log('⚠️ Picker cancelled by user');
          }
          setIsLoading(false);
        })
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error('❌ Error opening picker:', error);
      toast({
        title: 'Error',
        description: 'Failed to open Google Drive picker. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  if (needsAuth) {
    return <DriveReauthorization onSuccess={() => setNeedsAuth(false)} />;
  }

  return (
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
          Attach from Drive
        </>
      )}
    </Button>
  );
}

// Type declaration for Google Picker API
declare global {
  interface Window {
    gapi: any;
    google: {
      picker: {
        PickerBuilder: new () => any;
        ViewId: {
          DOCS: string;
          DOCS_IMAGES: string;
          DOCS_VIDEOS: string;
          SPREADSHEETS: string;
          PRESENTATIONS: string;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
        };
      };
    };
  }
}
