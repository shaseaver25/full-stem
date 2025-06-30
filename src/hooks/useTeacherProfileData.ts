
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
