
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

export const useTeacherProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching teacher profile:', error);
        toast({
          title: "Error",
          description: "Failed to load teacher profile.",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
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

  const saveProfile = async (profileData: Partial<TeacherProfile>) => {
    if (!user) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('teacher_profiles')
        .upsert({
          user_id: user.id,
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

      await fetchProfile();
      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
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

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    saving,
    saveProfile,
    refetch: fetchProfile,
  };
};
