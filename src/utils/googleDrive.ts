import { supabase } from '@/integrations/supabase/client';

interface DriveToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

/**
 * Retrieve the stored Google Drive access token for the current user
 */
export const getDriveToken = async (): Promise<DriveToken | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return null;
    }

    console.log('🔍 Retrieving Drive token for user:', user.id);

    // Call the decrypt_token function to get the access token
    const { data: accessToken, error } = await supabase.rpc('decrypt_token', {
      user_id_param: user.id,
      provider_param: 'google'
    });

    if (error) {
      console.error('❌ Error retrieving token:', error);
      return null;
    }

    if (!accessToken) {
      console.warn('⚠️ No Google Drive token found for user');
      return null;
    }

    // Get token metadata from user_tokens table
    const { data: tokenData, error: metadataError } = await supabase
      .from('user_tokens')
      .select('expires_at, refresh_token_enc')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single();

    if (metadataError) {
      console.error('❌ Error retrieving token metadata:', metadataError);
      return null;
    }

    console.log('✅ Drive token retrieved successfully');

    return {
      access_token: accessToken,
      expires_at: tokenData?.expires_at ? new Date(tokenData.expires_at).getTime() : 0,
      refresh_token: tokenData?.refresh_token_enc ? 'encrypted' : undefined
    };
  } catch (error) {
    console.error('❌ Exception retrieving Drive token:', error);
    return null;
  }
};

/**
 * Check if the current Drive token is expired
 */
export const isTokenExpired = (token: DriveToken): boolean => {
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  
  const expired = token.expires_at < (now + bufferTime);
  
  if (expired) {
    console.warn('⚠️ Drive token is expired or expiring soon');
  }
  
  return expired;
};

/**
 * Refresh the Google Drive access token using the refresh token
 */
export const refreshDriveToken = async (): Promise<DriveToken | null> => {
  try {
    console.log('🔄 Attempting to refresh Drive token...');

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
          provider: 'google',
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
 * Get a valid Drive token, refreshing if necessary
 */
export const getValidDriveToken = async (): Promise<string | null> => {
  try {
    console.log('🔍 Getting valid Drive token...');
    const token = await getDriveToken();
    
    if (!token) {
      console.log('⚠️ No token found in database');
      console.log('💡 User needs to sign in with Google to enable Drive access');
      return null;
    }

    console.log('📅 Checking token expiration...', {
      expiresAt: new Date(token.expires_at).toLocaleString(),
      isExpired: isTokenExpired(token),
      hasRefreshToken: !!token.refresh_token
    });

    if (isTokenExpired(token)) {
      console.log('🔄 Token expired, refreshing...');
      const refreshedToken = await refreshDriveToken();
      if (!refreshedToken) {
        console.error('❌ Failed to refresh token - user may need to re-authenticate');
        return null;
      }
      return refreshedToken.access_token;
    }

    console.log('✅ Token is valid');
    return token.access_token;
  } catch (error) {
    console.error('❌ Error getting valid Drive token:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return null;
  }
};

/**
 * Upload a file to Google Drive
 */
export const uploadToDrive = async (
  file: File,
  fileName?: string,
  folderId?: string
): Promise<{ success: boolean; fileId?: string; error?: string }> => {
  try {
    console.log('📤 Uploading file to Google Drive:', file.name);

    const accessToken = await getValidDriveToken();
    
    if (!accessToken) {
      return {
        success: false,
        error: 'No valid Drive access token. Please sign in with Google.'
      };
    }

    // Prepare metadata
    const metadata = {
      name: fileName || file.name,
      mimeType: file.type,
      ...(folderId && { parents: [folderId] })
    };

    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    console.log('🚀 Sending upload request to Google Drive API...');

    // Upload to Google Drive
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Drive upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      if (response.status === 403) {
        console.error('🚫 403 Forbidden - Possible causes:');
        console.error('  1. Drive scope not granted during OAuth');
        console.error('  2. API key restrictions in Google Cloud Console');
        console.error('  3. Token expired or invalid');
        return {
          success: false,
          error: 'Drive access denied. Please sign in again with Google to grant Drive permissions.'
        };
      }
      
      return {
        success: false,
        error: `Upload failed: ${response.statusText}`
      };
    }

    const result = await response.json();
    console.log('✅ File uploaded successfully to Drive:', result.id);

    return {
      success: true,
      fileId: result.id
    };
  } catch (error) {
    console.error('❌ Exception during Drive upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Check if the user has Drive access configured
 * Includes retry logic for race conditions after login
 */
export const hasDriveAccess = async (): Promise<boolean> => {
  // First attempt
  let token = await getDriveToken();
  if (token !== null) return true;

  // Check if user has Google provider linked
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const hasGoogleProvider = user.app_metadata?.providers?.includes('google') || 
                           user.app_metadata?.provider === 'google';

  // If user has Google provider but no token yet (race condition), retry once after delay
  if (hasGoogleProvider) {
    console.log('⏳ User has Google provider, retrying token fetch...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    token = await getDriveToken();
    return token !== null;
  }

  return false;
};

/**
 * Get Drive file metadata
 */
export const getDriveFileMetadata = async (fileId: string) => {
  try {
    const accessToken = await getValidDriveToken();
    
    if (!accessToken) {
      throw new Error('No valid Drive access token');
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink`,
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
    console.error('❌ Error getting Drive file metadata:', error);
    throw error;
  }
};
