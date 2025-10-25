import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGoogleAuth = () => {
  const { toast } = useToast();

  const signInWithGoogle = useCallback(async () => {
    console.log('🔐 Initiating Google OAuth for Drive access...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Store current location to return after OAuth
      const returnTo = window.location.pathname + window.location.search;
      sessionStorage.setItem('oauth_return_to', returnTo);
      console.log('📍 Stored return location:', returnTo);

      // Use linkIdentity to add Google OAuth to existing account
      const { data, error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile openid https://www.googleapis.com/auth/drive.file',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('❌ Failed to link Google identity:', error);
        toast({
          title: "Connection Failed",
          description: "Could not connect to Google Drive. Please try again.",
          variant: "destructive"
        });
        return { success: false, error };
      }

      console.log('✅ Google identity link initiated:', data);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Error during Google sign-in:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: err };
    }
  }, [toast]);

  useEffect(() => {
    console.log('🔧 useGoogleAuth hook initialized');

    // Listen for OAuth callback
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, {
          hasSession: !!session,
          hasProviderToken: !!session?.provider_token,
          provider: session?.user?.app_metadata?.provider
        });

        // Handle Google OAuth sign-in or identity linking
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.provider_token) {
          console.log('🔐 Google OAuth detected with provider token');
          console.log('📊 Session details:', {
            userId: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata.provider,
            tokenPresent: !!session.provider_token,
            refreshTokenPresent: !!session.provider_refresh_token,
            expiresAt: session.expires_at
          });

          // Store OAuth tokens securely
          try {
            console.log('💾 Attempting to store OAuth tokens...');
            
            const { data, error } = await supabase.functions.invoke('store-oauth-tokens', {
              body: {
                provider: 'google',
                session: {
                  provider_token: session.provider_token,
                  provider_refresh_token: session.provider_refresh_token,
                  expires_at: session.expires_at,
                  expires_in: session.expires_in
                }
              },
            });

            if (error) {
              console.error('❌ Failed to store OAuth tokens:', error);
              toast({
                title: "Warning",
                description: "Signed in successfully, but failed to store Drive access token. Drive features may be limited.",
                variant: "destructive"
              });
            } else {
              console.log('✅ OAuth tokens stored successfully:', data);
              toast({
                title: "Success",
                description: "Google Drive access enabled!",
              });
            }
          } catch (err) {
            console.error('❌ Error storing tokens:', err);
            toast({
              title: "Error",
              description: "Failed to secure Drive access. Please try signing in again.",
              variant: "destructive"
            });
          }
        } else if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && !session?.provider_token) {
          console.log('ℹ️ Auth event without OAuth provider token');
        }
      }
    );

    return () => {
      console.log('🔌 useGoogleAuth hook cleanup');
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);

  return {
    signInWithGoogle
  };
};
