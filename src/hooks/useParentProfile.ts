
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useParentProfile = () => {
  const [parentProfile, setParentProfile] = useState<{ id: string } | null>(null);
  const { toast } = useToast();

  const fetchParentProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Setup Required",
          description: "Please complete your parent profile setup",
          variant: "destructive"
        });
        return null;
      }

      setParentProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      toast({
        title: "Error",
        description: "Failed to load parent profile",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    parentProfile,
    fetchParentProfile
  };
};
