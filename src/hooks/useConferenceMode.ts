import { useEffect } from 'react';

/**
 * Hook to disable unnecessary auth/settings checks for conference mode
 * This reduces database load by ~4 queries per page load
 * Critical for 600+ concurrent conference users
 */
export const useConferenceMode = () => {
  useEffect(() => {
    // Set flag to skip expensive auth checks
    sessionStorage.setItem('conferenceMode', 'true');
    
    return () => {
      sessionStorage.removeItem('conferenceMode');
    };
  }, []);
};

export const isConferenceMode = () => {
  return sessionStorage.getItem('conferenceMode') === 'true';
};
