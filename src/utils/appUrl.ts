/**
 * Get the application URL for sharing and QR codes
 * Returns the deployed URL when available, otherwise current origin
 * 
 * IMPORTANT: Replace 'YOUR-DEPLOYED-URL' with your actual deployed domain
 * (e.g., 'https://yourdomain.com' or your custom domain)
 */
export const getAppUrl = (): string => {
  const origin = window.location.origin;
  
  // If we're on Lovable preview/editor, return configured URL
  if (origin.includes('lovableproject.com') || origin.includes('lovable.app')) {
    // TODO: Replace with your actual deployed URL
    // Example: return 'https://yourdomain.com';
    return 'YOUR-DEPLOYED-URL';
  }
  
  return origin;
};

/**
 * Get the join class URL for sharing
 */
export const getJoinClassUrl = (classCode?: string): string => {
  const baseUrl = `${getAppUrl()}/classes/join`;
  return classCode ? `${baseUrl}?code=${classCode}` : baseUrl;
};
