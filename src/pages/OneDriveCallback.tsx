import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const OneDriveCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing (React Strict Mode protection)
      if (hasProcessed.current) {
        console.log('⏭️ Callback already processed, skipping...');
        return;
      }

      hasProcessed.current = true;

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        console.error('❌ OneDrive OAuth error:', error);
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect to OneDrive. Please try again.',
          variant: 'destructive'
        });
        navigate(state || '/');
        return;
      }

      if (!code) {
        console.error('❌ No authorization code received');
        toast({
          title: 'Connection Failed',
          description: 'No authorization code received from OneDrive.',
          variant: 'destructive'
        });
        navigate(state || '/');
        return;
      }

      console.log('🔐 Exchanging OneDrive authorization code...');

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: 'Authentication Required',
            description: 'Please sign in first.',
            variant: 'destructive'
          });
          navigate('/auth');
          return;
        }

        const { error: exchangeError } = await supabase.functions.invoke(
          'onedrive-oauth',
          {
            body: { code, state }
          }
        );

        if (exchangeError) {
          console.error('❌ Token exchange failed:', exchangeError);
          toast({
            title: 'Connection Failed',
            description: 'Failed to store OneDrive credentials.',
            variant: 'destructive'
          });
        } else {
          console.log('✅ OneDrive connected successfully');
          toast({
            title: 'Success',
            description: 'OneDrive connected successfully — you can now attach files.',
          });
        }

        // Return to the original page
        const returnUrl = sessionStorage.getItem('onedrive_return_to') || 
                         sessionStorage.getItem('oauth_return_to') || 
                         state || 
                         '/teacher/lesson-builder';
        
        sessionStorage.removeItem('oauth_return_to');
        sessionStorage.removeItem('onedrive_return_to');
        sessionStorage.removeItem('onedrive_link_attempt');
        
        navigate(returnUrl, { replace: true });
      } catch (error) {
        console.error('❌ Error during OneDrive callback:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive'
        });
        navigate(state || '/');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Connecting OneDrive...</p>
      </div>
    </div>
  );
};

export default OneDriveCallback;
