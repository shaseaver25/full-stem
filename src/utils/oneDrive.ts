import { supabase } from '@/integrations/supabase/client';

interface OneDriveToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

/**
 * Retrieve the stored OneDrive access token for the current user
 */
export const getOneDriveToken = async (): Promise<OneDriveToken | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return null;
    }

    console.log('🔍 Retrieving OneDrive token for user:', user.id);

    // Call the decrypt_token function to get the access token
    const { data: accessToken, error } = await supabase.rpc('decrypt_token', {
      user_id_param: user.id,
      provider_param: 'onedrive'
    });

    if (error) {
      console.error('❌ Error retrieving token:', error);
      return null;
    }

    if (!accessToken) {
      console.warn('⚠️ No OneDrive token found for user');
      return null;
    }

    // Get token metadata from user_tokens table
    const { data: tokenData, error: metadataError } = await supabase
      .from('user_tokens')
      .select('expires_at, refresh_token_enc')
      .eq('user_id', user.id)
      .eq('provider', 'onedrive')
      .single();

    if (metadataError) {
      console.error('❌ Error retrieving token metadata:', metadataError);
      return null;
    }

    console.log('✅ OneDrive token retrieved successfully');

    return {
      access_token: accessToken,
      expires_at: tokenData?.expires_at ? new Date(tokenData.expires_at).getTime() : 0,
      refresh_token: tokenData?.refresh_token_enc ? 'encrypted' : undefined
    };
  } catch (error) {
    console.error('❌ Exception retrieving OneDrive token:', error);
    return null;
  }
};

/**
 * Check if the current OneDrive token is expired
 */
export const isTokenExpired = (token: OneDriveToken): boolean => {
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  
  const expired = token.expires_at < (now + bufferTime);
  
  if (expired) {
    console.warn('⚠️ OneDrive token is expired or expiring soon');
  }
  
  return expired;
};

/**
 * Refresh the OneDrive access token using the refresh token
 */
export const refreshOneDriveToken = async (): Promise<OneDriveToken | null> => {
  try {
    console.log('🔄 Attempting to refresh OneDrive token...');

    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error || !session) {
      console.error('❌ Failed to refresh session:', error);
      return null;
    }

    if (session.provider_token) {
      console.log('✅ Token refreshed via Supabase session');
      
      // Store the new token
      await supabase.functions.invoke('store-oauth-tokens', {
        body: {
          provider: 'onedrive',
          session: {
            provider_token: session.provider_token,
            provider_refresh_token: session.provider_refresh_token,
            expires_at: session.expires_at,
            expires_in: session.expires_in
          }
        }
      });

      return {
        access_token: session.provider_token,
        expires_at: session.expires_at ? new Date(session.expires_at * 1000).getTime() : 0,
        refresh_token: session.provider_refresh_token
      };
    }

    console.warn('⚠️ No provider token in refreshed session');
    return null;
  } catch (error) {
    console.error('❌ Exception refreshing token:', error);
    return null;
  }
};

/**
 * Get a valid OneDrive token, refreshing if necessary
 */
export const getValidOneDriveToken = async (): Promise<string | null> => {
  try {
    console.log('🔍 Getting valid OneDrive token...');
    const token = await getOneDriveToken();
    
    if (!token) {
      console.log('⚠️ No token found in database');
      console.log('💡 User needs to sign in with Microsoft to enable OneDrive access');
      return null;
    }

    console.log('📅 Checking token expiration...', {
      expiresAt: new Date(token.expires_at).toLocaleString(),
      isExpired: isTokenExpired(token),
      hasRefreshToken: !!token.refresh_token
    });

    if (isTokenExpired(token)) {
      console.log('🔄 Token expired, refreshing...');
      const refreshedToken = await refreshOneDriveToken();
      if (!refreshedToken) {
        console.error('❌ Failed to refresh token - user may need to re-authenticate');
        return null;
      }
      return refreshedToken.access_token;
    }

    console.log('✅ Token is valid');
    return token.access_token;
  } catch (error) {
    console.error('❌ Error getting valid OneDrive token:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return null;
  }
};

/**
 * Check if the user has OneDrive access configured
 */
export const hasOneDriveAccess = async (): Promise<boolean> => {
  const token = await getOneDriveToken();
  return token !== null;
};

/**
 * Get OneDrive file metadata
 */
export const getOneDriveFileMetadata = async (fileId: string) => {
  try {
    const accessToken = await getValidOneDriveToken();
    
    if (!accessToken) {
      throw new Error('No valid OneDrive access token');
    }

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get file metadata: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error getting OneDrive file metadata:', error);
    throw error;
  }
};
