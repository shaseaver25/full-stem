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
    const handleCallback = async () => {
      console.log('🔄 OAuth callback initiated...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      if (!session) {
        console.log('⚠️ No session found');
        navigate('/auth');
        return;
      }

      console.log('✅ Session acquired:', {
        user: session.user.email,
        provider: session.user.app_metadata.provider,
        hasProviderToken: !!session.provider_token,
        hasProviderRefreshToken: !!session.provider_refresh_token
      });

      // Check if this is a Google OAuth session with Drive token
      if (session.provider_token) {
        console.log('🔐 Provider token detected, storing securely...');
        
        try {
          const { data, error: storeError } = await supabase.functions.invoke('store-oauth-tokens', {
            body: {
              provider: 'google',
              session: {
                provider_token: session.provider_token,
                provider_refresh_token: session.provider_refresh_token,
                expires_at: session.expires_at,
                expires_in: session.expires_in
              }
            }
          });

          if (storeError) {
            console.error('❌ Failed to store OAuth tokens:', storeError);
            toast({
              title: "Warning",
              description: "Signed in successfully, but failed to store Drive access. You may need to re-authenticate for Drive features.",
              variant: "destructive"
            });
          } else {
            console.log('✅ OAuth tokens stored successfully:', data);
            toast({
              title: "Success",
              description: "Signed in with Google Drive access enabled!",
            });
          }
        } catch (err) {
          console.error('❌ Error storing tokens:', err);
        }
      } else {
        console.log('ℹ️ No provider token (standard email/password sign-in)');
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
      }

      // Redirect to role-based dashboard
      // Skip redirect if user logged in through teacher portal
      const isTeacherPortalLogin = sessionStorage.getItem('teacherPortalLogin') === 'true';
      if (!isTeacherPortalLogin) {
        console.log('🔀 Redirecting to dashboard...');
        redirectToRoleDashboard(session.user.id, navigate);
      } else {
        console.log('🎓 Teacher portal login detected in callback, skipping redirect');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};

export default AuthCallback;
