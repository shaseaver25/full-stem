
import { useEffect } from 'react';
import { useTeacherAuth } from './useTeacherAuth';
import { useTeacherProfileData, TeacherProfile } from './useTeacherProfileData';
import { useTeacherProfileMutations } from './useTeacherProfileMutations';

export { type TeacherProfile } from './useTeacherProfileData';

/**
 * Comprehensive hook for managing teacher profile data and operations
 * 
 * @description This hook combines authentication, data fetching, and mutation capabilities
 * for teacher profiles. It automatically fetches the profile when a user is authenticated
 * and provides methods to save profile updates.
 * 
 * @returns {Object} Teacher profile management object
 * @returns {TeacherProfile|null} returns.profile - The current teacher profile data
 * @returns {boolean} returns.loading - Loading state for profile fetch operations
 * @returns {boolean} returns.saving - Loading state for profile save operations
 * @returns {Function} returns.saveProfile - Function to save profile updates
 * @returns {Function} returns.refetch - Function to manually refetch profile data
 * 
 * @example
 * ```tsx
 * function TeacherProfileForm() {
 *   const { profile, loading, saving, saveProfile } = useTeacherProfile();
 *   
 *   const handleSave = async () => {
 *     const success = await saveProfile({
 *       school_name: 'New School Name',
 *       subjects: ['Math', 'Science']
 *     });
 *     
 *     if (success) {
 *       console.log('Profile saved successfully');
 *     }
 *   };
 *   
 *   if (loading) return <div>Loading...</div>;
 *   
 *   return (
 *     <form onSubmit={handleSave}>
 *       {/* profile form fields */}
 *     </form>
 *   );
 * }
 * ```
 * 
 * @sideEffects
 * - Automatically fetches profile data when user authentication changes
 * - Shows toast notifications on save success/failure
 * - Updates profile state after successful saves
 */
export const useTeacherProfile = () => {
  const { user } = useTeacherAuth();
  const { profile, loading, setProfile, fetchProfile } = useTeacherProfileData();
  const { saving, saveProfile: saveProfileMutation } = useTeacherProfileMutations();

  const saveProfile = async (profileData: Partial<TeacherProfile>) => {
    if (!user) return false;
    
    const success = await saveProfileMutation(user.id, profileData, () => {
      // Refetch profile after successful save
      fetchProfile(user.id);
    });
    
    return success;
  };

  const refetch = () => {
    if (user) {
      fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user]);

  return {
    profile,
    loading,
    saving,
    saveProfile,
    refetch,
  };
};
