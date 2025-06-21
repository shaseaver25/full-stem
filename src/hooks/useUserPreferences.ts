
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface UserPreferences {
  'User Email': string;
  'Preferred Language': string | null;
  'Enable Translation View': boolean | null;
  'Enable Read-Aloud': boolean | null;
  'Reading Level': string | null;
  'Text Speed': string | null;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('User Preferences')
        .select('*')
        .eq('User Email', user.email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load preferences.",
          variant: "destructive",
        });
        return;
      }

      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Omit<UserPreferences, 'User Email'>) => {
    if (!user?.email) return;

    setSaving(true);
    try {
      const preferencesData = {
        'User Email': user.email,
        ...newPreferences,
      };

      const { error } = await supabase
        .from('User Preferences')
        .upsert(preferencesData, {
          onConflict: 'User Email'
        });

      if (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "Error",
          description: "Failed to save preferences.",
          variant: "destructive",
        });
        return false;
      }

      setPreferences(preferencesData);
      toast({
        title: "Success",
        description: "Your preferences have been saved successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user?.email]);

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    refetch: fetchPreferences,
  };
};
