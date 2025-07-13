
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * TypeScript interface for teacher profile data structure
 * 
 * @interface TeacherProfile
 * @property {string} id - Unique identifier for the profile
 * @property {string} user_id - Associated user ID from auth system
 * @property {string|null} school_name - Name of the school where teacher works
 * @property {string[]|null} grade_levels - Array of grade levels taught
 * @property {string[]|null} subjects - Array of subjects taught
 * @property {number|null} years_experience - Years of teaching experience
 * @property {string} certification_status - Teacher certification status
 * @property {number} pd_hours - Professional development hours completed
 * @property {boolean} onboarding_completed - Whether onboarding is complete
 * @property {string} created_at - Profile creation timestamp
 * @property {string} updated_at - Last update timestamp
 */
export interface TeacherProfile {
  id: string;
  user_id: string;
  school_name: string | null;
  grade_levels: string[] | null;
  subjects: string[] | null;
  years_experience: number | null;
  certification_status: string;
  pd_hours: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook for managing teacher profile data operations
 * 
 * @description Handles fetching, caching, and state management for teacher profile data.
 * Automatically creates initial profile if none exists for a user.
 * 
 * @returns {Object} Profile data management object
 * @returns {TeacherProfile|null} returns.profile - Current profile data
 * @returns {boolean} returns.loading - Loading state for fetch operations
 * @returns {Function} returns.setProfile - Direct state setter for profile
 * @returns {Function} returns.fetchProfile - Function to fetch profile by user ID
 * 
 * @example
 * ```tsx
 * function useProfileEffect() {
 *   const { profile, loading, fetchProfile } = useTeacherProfileData();
 *   
 *   useEffect(() => {
 *     if (userId) {
 *       fetchProfile(userId);
 *     }
 *   }, [userId]);
 *   
 *   return { profile, loading };
 * }
 * ```
 * 
 * @sideEffects
 * - Creates initial profile in database if none exists
 * - Shows toast notifications for errors
 * - Updates loading state during operations
 */
export const useTeacherProfileData = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const createInitialProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .insert({
          user_id: userId,
          onboarding_completed: false,
          certification_status: 'pending',
          pd_hours: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating initial teacher profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating initial teacher profile:', error);
      return null;
    }
  };

  const fetchProfile = async (userId: string) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching teacher profile:', error);
        toast({
          title: "Error",
          description: "Failed to load teacher profile.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If no profile exists, create one
      if (!data) {
        console.log('No profile found, creating initial profile...');
        const newProfile = await createInitialProfile(userId);
        setProfile(newProfile);
      } else {
        console.log('Profile found:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    setProfile,
    fetchProfile
  };
};
