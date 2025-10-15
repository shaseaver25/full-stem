import { supabase } from '@/integrations/supabase/client';

/**
 * Debug utility to check Drive integration status
 */
export const checkDriveStatus = async () => {
  console.log('🔍 === Drive Integration Debug ===');
  
  // Check auth status
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('👤 User:', user?.email);
  console.log('🔑 Auth provider:', user?.app_metadata?.provider);
  
  if (authError) {
    console.error('❌ Auth error:', authError);
    return;
  }

  if (!user) {
    console.log('⚠️ No user logged in');
    return;
  }

  // Check for stored tokens
  const { data: tokens, error: tokenError } = await supabase
    .from('user_tokens')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .single();

  if (tokenError) {
    console.error('❌ Token query error:', tokenError);
  } else if (tokens) {
    console.log('✅ Token found in database');
    console.log('📅 Expires at:', new Date(tokens.expires_at).toLocaleString());
    console.log('🔄 Has refresh token:', !!tokens.refresh_token_enc);
    console.log('⏰ Token expired:', new Date(tokens.expires_at) < new Date());
  } else {
    console.log('⚠️ No tokens found for user');
  }

  // Check session
  const { data: { session } } = await supabase.auth.getSession();
  console.log('🎫 Session provider token present:', !!session?.provider_token);
  console.log('🎫 Session provider refresh token present:', !!session?.provider_refresh_token);

  console.log('=== End Debug ===');
};

/**
 * Test Drive API access with current token
 */
export const testDriveAccess = async (accessToken: string) => {
  console.log('🧪 Testing Drive API access...');
  
  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Drive API access successful');
      console.log('👤 Drive user:', data.user?.emailAddress);
      return true;
    } else {
      console.error('❌ Drive API access failed:', {
        status: response.status,
        error: data
      });
      
      if (response.status === 403) {
        console.error('🚫 403 Forbidden - Possible causes:');
        console.error('  1. Scope "https://www.googleapis.com/auth/drive.file" not granted');
        console.error('  2. API key restrictions in Google Cloud Console');
        console.error('  3. Google Picker API not enabled');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Drive API test failed:', error);
    return false;
  }
};
