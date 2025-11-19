/**
 * Get the application URL for sharing and QR codes
 * Returns the deployed URL when available, otherwise current origin
 */
export const getAppUrl = (): string => {
  const origin = window.location.origin;
  
  // If we're on Lovable preview/editor, use deployed URL
  if (origin.includes('lovableproject.com') || origin.includes('lovable.app')) {
    return 'https://full-stem.lovable.app';
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
