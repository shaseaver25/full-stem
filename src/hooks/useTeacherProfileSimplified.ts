import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export const useTeacherProfileSimplified = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const mountedRef = useRef(true);

  const createInitialProfile = async (userId: string): Promise<TeacherProfile | null> => {
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
    if (!mountedRef.current || !userId) return;

    console.log('fetchProfile called with userId:', userId);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!mountedRef.current) return;

      console.log('Profile fetch result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching teacher profile:', error);
        toast({
          title: "Error",
          description: "Failed to load teacher profile.",
          variant: "destructive",
        });
        setProfile(null);
        return;
      }

      if (data) {
        console.log('Profile found:', data);
        setProfile(data);
        return;
      }

      // No profile exists, create one
      console.log('No profile found, creating initial profile...');
      const newProfile = await createInitialProfile(userId);
      
      if (mountedRef.current && newProfile) {
        console.log('New profile created:', newProfile);
        setProfile(newProfile);
      }
      
    } catch (error) {
      if (!mountedRef.current) return;
      
      console.error('Error in fetchProfile:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher profile.",
        variant: "destructive",
      });
      setProfile(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const saveProfile = async (profileData: Partial<TeacherProfile>): Promise<boolean> => {
    if (!user?.id || !mountedRef.current) return false;

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

      if (!mountedRef.current) return false;

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
      
      // Refetch the profile
      await fetchProfile(user.id);
      
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      
      console.error('Error saving teacher profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile.",
        variant: "destructive",
      });
      return false;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    profile,
    loading,
    saving,
    saveProfile,
    refetch: () => user?.id && fetchProfile(user.id)
  };
};