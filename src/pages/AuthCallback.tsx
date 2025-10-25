import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { redirectToRoleDashboard } from '@/utils/roleRedirect';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        console.log('🔄 OAuth callback initiated...');
        
        // Get the session with hash from URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message || "Failed to complete authentication",
            variant: "destructive"
          });
          navigate('/auth', { replace: true });
          return;
        }

        if (!session) {
          console.log('⚠️ No session found');
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue",
          });
          navigate('/auth', { replace: true });
          return;
        }

        console.log('✅ Session acquired:', {
          user: session.user.email,
          provider: session.user.app_metadata.provider,
          hasProviderToken: !!session.provider_token,
        });

        // Store OAuth tokens if present (non-blocking)
        if (session.provider_token) {
          console.log('🔐 Provider token detected, storing securely...');
          
          supabase.functions.invoke('store-oauth-tokens', {
            body: {
              provider: 'google',
              session: {
                provider_token: session.provider_token,
                provider_refresh_token: session.provider_refresh_token,
                expires_at: session.expires_at,
                expires_in: session.expires_in
              }
            }
          }).then(({ error: storeError }) => {
            if (storeError) {
              console.error('❌ Failed to store OAuth tokens:', storeError);
            } else {
              console.log('✅ OAuth tokens stored successfully');
            }
          }).catch(err => {
            console.error('❌ Error storing tokens:', err);
          });
        }

        if (!mounted) return;

        // Check if there's a stored return location (for Drive OAuth linking)
        const returnTo = sessionStorage.getItem('oauth_return_to');
        
        if (returnTo) {
          console.log('📍 Returning to stored location:', returnTo);
          sessionStorage.removeItem('oauth_return_to');
          
          toast({
            title: "Google Drive Connected!",
            description: "You can now attach files from your Drive.",
          });
          
          navigate(returnTo, { replace: true });
        } else {
          toast({
            title: "Welcome!",
            description: "Redirecting to your dashboard...",
          });

          console.log('✅ Authentication successful, redirecting...');
          
          // Use replace to prevent back button issues
          await redirectToRoleDashboard(session.user.id, (path) => navigate(path, { replace: true }));
        }
      } catch (err) {
        console.error('❌ Unexpected error in auth callback:', err);
        if (mounted) {
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive"
          });
          navigate('/auth', { replace: true });
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};

export default AuthCallback;
