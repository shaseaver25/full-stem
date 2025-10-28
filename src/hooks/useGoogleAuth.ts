import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useGoogleAuth = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    console.log('🔐 Initiating Google OAuth with full-page redirect...');

    // Use signInWithOAuth to trigger a full-page redirect to Google's auth page
    // This avoids the iframe "refused to connect" error
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Request the drive.file scope for Google Drive access
        scopes: 'https://www.googleapis.com/auth/drive.file',
        // Redirect back to our auth callback page after authentication
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      },
    });

    if (authError) {
      console.error('❌ Google Drive connection error:', authError.message);
      setError(authError.message);
      toast({
        title: 'Connection Failed',
        description: authError.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return { success: false, error: authError };
    }

    console.log('✅ Redirecting to Google for authentication...');
    // The page will redirect, so we don't need to call onSuccess here
    // The auth callback will handle token storage
    setIsLoading(false);
    return { success: true };
  };

  return { signInWithGoogle, isLoading, error };
};
