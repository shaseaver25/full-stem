import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FocusModeContextType {
  focusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  isLoading: boolean;
}

const FocusModeContext = createContext<FocusModeContextType | null>(null);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [focusMode, setFocusModeState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load focus mode setting from Supabase on mount
  useEffect(() => {
    loadFocusMode();
  }, []);

  // Apply focus-mode class to document element when state changes
  useEffect(() => {
    document.documentElement.classList.toggle('focus-mode', focusMode);
  }, [focusMode]);

  const loadFocusMode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('focus_mode_settings')
        .select('enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading focus mode settings:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setFocusModeState(data.enabled);
      }
    } catch (error) {
      console.error('Error in loadFocusMode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setFocusMode = async (enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to save focus mode settings.',
          variant: 'destructive',
        });
        return;
      }

      // Optimistically update state
      setFocusModeState(enabled);

      const { error } = await supabase
        .from('focus_mode_settings')
        .upsert({
          user_id: user.id,
          enabled,
        });

      if (error) {
        console.error('Error saving focus mode settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to save focus mode settings.',
          variant: 'destructive',
        });
        // Revert on error
        setFocusModeState(!enabled);
      }
    } catch (error) {
      console.error('Error in setFocusMode:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <FocusModeContext.Provider value={{ focusMode, setFocusMode, isLoading }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}
