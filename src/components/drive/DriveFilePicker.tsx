import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FolderOpen, Loader2 } from 'lucide-react';
import { getValidDriveToken, hasDriveAccess } from '@/utils/googleDrive';
import { DriveReauthorization } from './DriveReauthorization';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/utils/env';

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

const GOOGLE_API_KEY = env.VITE_GOOGLE_API_KEY;

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
      console.log('📋 Current user:', await (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.email;
      })());
      
      const accessToken = await getValidDriveToken();

      if (!accessToken) {
        console.error('❌ No valid access token available');
        console.log('💡 Possible causes:');
        console.log('  1. User not signed in with Google');
        console.log('  2. Drive scope not granted during OAuth');
        console.log('  3. Token expired and refresh failed');
        
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
      console.log('🔑 API Key present:', !!GOOGLE_API_KEY);

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
          console.log('📥 Picker callback:', data.action);
          
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
      
      let errorMessage = 'Failed to open Google Drive picker. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Drive access denied. Please sign in again with Google to grant Drive permissions.';
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
