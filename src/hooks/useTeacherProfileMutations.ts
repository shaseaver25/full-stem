
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TeacherProfile } from './useTeacherProfileData';

export const useTeacherProfileMutations = () => {
  const [saving, setSaving] = useState(false);

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
