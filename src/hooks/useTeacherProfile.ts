
import { useEffect } from 'react';
import { useTeacherAuth } from './useTeacherAuth';
import { useTeacherProfileData, TeacherProfile } from './useTeacherProfileData';
import { useTeacherProfileMutations } from './useTeacherProfileMutations';

export { type TeacherProfile } from './useTeacherProfileData';

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
