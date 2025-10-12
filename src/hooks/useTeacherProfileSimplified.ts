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
  const [loading, setLoading] = useState(true); // Start as true
  const [saving, setSaving] = useState(false);
  const mountedRef = useRef(true);
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

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
    console.log('fetchProfile called with userId:', userId);
    
    if (!userId) {
      console.log('No userId provided');
      setLoading(false);
      setProfile(null);
      return;
    }

    if (!mountedRef.current) {
      console.log('Component unmounted, skipping fetch');
      return;
    }

    setLoading(true);
    
    try {
      console.log('About to fetch teacher profile for user:', userId);
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('Profile fetch completed:', { 
        hasData: !!data, 
        errorCode: error?.code, 
        errorMessage: error?.message,
        dataPreview: data ? { id: data.id, onboarding_completed: data.onboarding_completed } : null
      });

      if (!mountedRef.current) {
        console.log('Component unmounted after fetch, skipping state update');
        return;
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching teacher profile:', error);
        toast({
          title: "Error",
          description: `Failed to load teacher profile: ${error.message}`,
          variant: "destructive",
        });
        setProfile(null);
        return;
      }

      if (data) {
        console.log('Profile found, setting profile state');
        setProfile(data);
        return;
      }

      // No profile exists, create one
      console.log('No profile found, creating initial profile...');
      const newProfile = await createInitialProfile(userId);
      
      if (!mountedRef.current) {
        console.log('Component unmounted after profile creation');
        return;
      }
      
      if (newProfile) {
        console.log('New profile created:', newProfile);
        setProfile(newProfile);
      } else {
        console.log('Failed to create profile');
        setProfile(null);
      }
      
    } catch (error: any) {
      console.error('Exception in fetchProfile:', error?.message || error);
      
      if (!mountedRef.current) {
        console.log('Component unmounted during error handling');
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load teacher profile.",
        variant: "destructive",
      });
      setProfile(null);
    } finally {
      // CRITICAL: Always set loading to false in finally block
      if (mountedRef.current) {
        console.log('Setting loading to false');
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
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Only fetch if we have a new user and aren't already fetching
    if (user?.id && user.id !== lastFetchedUserId.current && !isFetchingRef.current) {
      lastFetchedUserId.current = user.id;
      isFetchingRef.current = true;
      
      fetchProfile(user.id).finally(() => {
        isFetchingRef.current = false;
      });
    } else if (!user?.id) {
      lastFetchedUserId.current = null;
      setProfile(null);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    profile,
    loading,
    saving,
    saveProfile,
    refetch: () => user?.id && fetchProfile(user.id)
  };
};