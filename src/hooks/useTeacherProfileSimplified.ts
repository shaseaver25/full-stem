import React, { useState, useEffect, useRef } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Track if we've fetched for this user to prevent re-fetching
  const fetchedForUserId = useRef<string | null>(null);
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      // Don't fetch if:
      // 1. No user
      // 2. Already fetched for this user
      // 3. Currently fetching
      if (!user?.id || fetchedForUserId.current === user.id || isFetching.current) {
        if (!user?.id) {
          setLoading(false);
        }
        return;
      }

      isFetching.current = true;
      fetchedForUserId.current = user.id;

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
            description: `Failed to load profile: ${error.message}`,
            variant: "destructive",
          });
          setProfile(null);
          setLoading(false);
          isFetching.current = false;
          return;
        }

        if (data) {
          setProfile(data);
          setLoading(false);
          isFetching.current = false;
          return;
        }

        // No profile found, create one
        const { data: newProfile, error: createError } = await supabase
          .from('teacher_profiles')
          .insert({
            user_id: user.id,
            onboarding_completed: false,
            certification_status: 'pending',
            pd_hours: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setProfile(null);
        } else {
          setProfile(newProfile);
        }
      } catch (error: any) {
        console.error('Exception fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchProfile();
  }, [user?.id]);

  const saveProfile = async (profileData: Partial<TeacherProfile>): Promise<boolean> => {
    if (!user?.id) return false;

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
        console.error('Error saving profile:', error);
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

      // Update local state
      const { data } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
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

  const refetch = async () => {
    if (!user?.id) return;
    
    // Reset the fetched flag and fetch again
    fetchedForUserId.current = null;
    isFetching.current = false;
    setLoading(true);
    
    // Trigger re-fetch by clearing and setting user id
    const userId = user.id;
    fetchedForUserId.current = userId;
  };

  return {
    profile,
    loading,
    saving,
    saveProfile,
    refetch,
  };
};
