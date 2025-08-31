import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  'User Email': string;
  'Reading Level'?: string;
  'Preferred Language'?: string;
  'Text Speed'?: string;
  'Enable Read-Aloud'?: boolean;
  'Enable Translation View'?: boolean;
}

export const useUserPreferencesOptimized = () => {
  const { user } = useAuth();

  console.log('useUserPreferencesOptimized: Starting with user:', user?.email);

  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['userPreferences-independent', user?.email],
    queryFn: async (): Promise<UserPreferences | null> => {
      console.log('Fetching user preferences for:', user?.email);
      
      if (!user?.email) {
        console.log('No user email, returning default preferences');
        return {
          'User Email': '',
          'Reading Level': 'Grade 5',
          'Preferred Language': 'English',
          'Text Speed': 'Normal',
          'Enable Read-Aloud': true,
          'Enable Translation View': false,
        };
      }

      try {
        const { data, error } = await supabase
          .from('User Preferences')
          .select('*')
          .eq('User Email', user.email)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user preferences:', error);
          // Don't throw - return defaults instead
        }

        console.log('User preferences fetched:', data ? 'Found' : 'Using defaults');

        // Return data if found, otherwise defaults
        return data as UserPreferences || {
          'User Email': user.email,
          'Reading Level': 'Grade 5',
          'Preferred Language': 'English',
          'Text Speed': 'Normal',
          'Enable Read-Aloud': true,
          'Enable Translation View': false,
        };
      } catch (err) {
        console.error('Exception fetching user preferences:', err);
        // Return defaults on error
        return {
          'User Email': user?.email || '',
          'Reading Level': 'Grade 5',
          'Preferred Language': 'English',
          'Text Speed': 'Normal',
          'Enable Read-Aloud': true,
          'Enable Translation View': false,
        };
      }
    },
    enabled: true, // Always enabled - will return defaults if no user
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once for user preferences
  });

  console.log('useUserPreferencesOptimized: Returning', {
    hasPreferences: !!preferences,
    readingLevel: preferences?.['Reading Level'],
    isLoading,
    error: error?.message
  });

  return {
    preferences,
    isLoading,
    error
  };
};