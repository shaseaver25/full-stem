
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for managing parent profile data and authentication
 * 
 * @description Provides functionality to fetch and manage parent profile information.
 * Handles profile validation and provides user feedback for setup requirements.
 * 
 * @returns {Object} Parent profile management object
 * @returns {Object|null} returns.parentProfile - Current parent profile data
 * @returns {Function} returns.fetchParentProfile - Function to fetch parent profile
 * 
 * @example
 * ```tsx
 * function ParentDashboard() {
 *   const { parentProfile, fetchParentProfile } = useParentProfile();
 *   
 *   useEffect(() => {
 *     fetchParentProfile();
 *   }, []);
 *   
 *   if (!parentProfile) {
 *     return <div>Please complete your profile setup</div>;
 *   }
 *   
 *   return <div>Welcome to the parent portal!</div>;
 * }
 * ```
 * 
 * @sideEffects
 * - Shows toast notifications for setup requirements and errors
 * - Updates parentProfile state with fetched data
 * - Handles authentication validation
 */
export const useParentProfile = () => {
  const [parentProfile, setParentProfile] = useState<{ id: string } | null>(null);
  const { toast } = useToast();

  /**
   * Fetches the parent profile for the current authenticated user
   * 
   * @returns {Promise<Object|null>} Promise resolving to parent profile or null
   * 
   * @throws {Error} When user is not authenticated
   * @throws {Error} When profile fetch fails
   */
  const fetchParentProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Setup Required",
          description: "Please complete your parent profile setup",
          variant: "destructive"
        });
        return null;
      }

      setParentProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      toast({
        title: "Error",
        description: "Failed to load parent profile",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    parentProfile,
    fetchParentProfile
  };
};
