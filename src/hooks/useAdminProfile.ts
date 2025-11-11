import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AdminType = 'school' | 'homeschool' | 'workforce';

export interface AdminProfile {
  id: string;
  user_id: string;
  admin_type: AdminType;
  organization_name: string | null;
  organization_size: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile found - don't auto-create, just set null
            // Admin profiles should only be created via role assignment
            console.log('No admin profile found for user');
            setProfile(null);
          } else {
            console.error('Error fetching admin profile:', error);
            setError(error.message);
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error in useAdminProfile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();

    // Set up real-time subscription
    if (user?.id) {
      const channelName = `admin_profile_${user.id}`;
      
      // Remove any existing channel with this name first
      const existingChannel = supabase.channel(channelName);
      supabase.removeChannel(existingChannel);

      // Create new subscription
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'admin_profiles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setProfile(payload.new as AdminProfile);
            } else if (payload.eventType === 'DELETE') {
              setProfile(null);
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const updateAdminProfile = async (updates: Partial<AdminProfile>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating admin profile:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in updateAdminProfile:', err);
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    adminType: profile?.admin_type || null,
    onboardingCompleted: profile?.onboarding_completed || false,
    updateAdminProfile,
  };
};
