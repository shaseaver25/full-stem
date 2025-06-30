
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TeacherProfile } from './useTeacherProfileData';

/**
 * Hook for teacher profile mutation operations (create, update, delete)
 * 
 * @description Handles all write operations for teacher profiles including upserts,
 * error handling, and success callbacks. Provides loading states and user feedback.
 * 
 * @returns {Object} Profile mutation operations object
 * @returns {boolean} returns.saving - Loading state for save operations
 * @returns {Function} returns.saveProfile - Function to save/update profile data
 * 
 * @example
 * ```tsx
 * function ProfileSaveButton() {
 *   const { saving, saveProfile } = useTeacherProfileMutations();
 *   
 *   const handleSave = async () => {
 *     const success = await saveProfile(
 *       'user-123',
 *       { school_name: 'New School' },
 *       () => console.log('Profile saved!')
 *     );
 *     
 *     if (success) {
 *       // Handle success
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleSave} disabled={saving}>
 *       {saving ? 'Saving...' : 'Save Profile'}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @sideEffects
 * - Shows toast notifications for success/failure
 * - Executes optional success callback after successful saves
 * - Updates saving state during operations
 */
export const useTeacherProfileMutations = () => {
  const [saving, setSaving] = useState(false);

  /**
   * Saves or updates a teacher profile
   * 
   * @param {string} userId - The user ID to associate with the profile
   * @param {Partial<TeacherProfile>} profileData - Profile data to save/update
   * @param {Function} [onSuccess] - Optional callback executed on successful save
   * @returns {Promise<boolean>} Promise resolving to success status
   */
  const saveProfile = async (
    userId: string, 
    profileData: Partial<TeacherProfile>,
    onSuccess?: () => void
  ) => {
    if (!userId) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('teacher_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving teacher profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error saving teacher profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveProfile
  };
};
