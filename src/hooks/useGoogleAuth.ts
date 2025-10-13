import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGoogleAuth = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Listen for OAuth callback
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.provider_token) {
          // Store OAuth tokens securely
          try {
            const { data, error } = await supabase.functions.invoke('store-oauth-tokens', {
              body: {
                provider: 'google',
                session: session,
              },
            });

            if (error) {
              console.error('Failed to store OAuth tokens:', error);
              toast({
                title: "Warning",
                description: "Signed in successfully, but failed to store Drive access token.",
                variant: "destructive"
              });
            } else {
              console.log('OAuth tokens stored successfully:', data);
              toast({
                title: "Success",
                description: "Signed in with Google and secured Drive access.",
              });
            }
          } catch (err) {
            console.error('Error storing tokens:', err);
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);

  return null;
};
