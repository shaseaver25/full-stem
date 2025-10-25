import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for handling OneDrive authentication via Supabase
 * Manages Microsoft OAuth flow and token storage
 */
export const useOneDriveAuth = () => {
  const { toast } = useToast();

  /**
   * Initiates Microsoft OAuth flow to link OneDrive access
   */
  const signInWithMicrosoft = useCallback(async () => {
    try {
      console.log('🔗 Initiating Microsoft OneDrive connection...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to connect your OneDrive account.',
          variant: 'destructive'
        });
        return { success: false };
      }

      // Store return URL for redirect after OAuth
      const returnUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('oauth_return_to', returnUrl);
      sessionStorage.setItem('onedrive_link_attempt', 'true');

      console.log('📍 Stored return URL:', returnUrl);

      // Open OAuth window
      const clientId = '8350983d-f94c-4357-8741-e83e576a49dc';
      const redirectUri = `${window.location.origin}/onedrive/callback`;
      const scopes = 'Files.ReadWrite offline_access User.Read';
      
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&state=${encodeURIComponent(returnUrl)}`;

      console.log('🔗 Redirecting to Microsoft OAuth...');
      window.location.href = authUrl;
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error during Microsoft sign-in:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      return { success: false };
    }
  }, [toast]);

  /**
   * Listen for auth state changes and store OAuth tokens
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 OneDrive auth state change:', event, {
          hasSession: !!session,
          hasProviderToken: !!session?.provider_token,
          identities: session?.user.identities?.map(i => i.provider),
          appMetadata: session?.user.app_metadata
        });
        
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
          // Check if we have a Microsoft/Azure identity linked
          const hasAzureIdentity = session.user.identities?.some(
            identity => identity.provider === 'azure'
          );
          
          console.log('🔍 Checking Azure identity:', { hasAzureIdentity, providerToken: !!session.provider_token });
          
          // Check if we have a Microsoft provider token (from linkIdentity)
          if (session.provider_token && hasAzureIdentity) {
            console.log('📥 Microsoft OAuth tokens detected, storing...');
            
            try {
              const { error: storeError } = await supabase.functions.invoke(
                'store-oauth-tokens',
                {
                  body: {
                    provider: 'onedrive',
                    session: {
                      provider_token: session.provider_token,
                      provider_refresh_token: session.provider_refresh_token,
                      expires_at: session.expires_at
                    }
                  }
                }
              );

              if (storeError) {
                console.error('❌ Failed to store OneDrive tokens:', storeError);
                toast({
                  title: 'Warning',
                  description: 'Connected to OneDrive but failed to store credentials.',
                  variant: 'destructive'
                });
              } else {
                console.log('✅ OneDrive tokens stored successfully');
                toast({
                  title: 'Success',
                  description: 'OneDrive connected successfully!',
                });
              }
            } catch (error) {
              console.error('❌ Error storing OneDrive tokens:', error);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  return { signInWithMicrosoft };
};
