import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AccessibilitySettings {
  ttsEnabled: boolean;
  translationEnabled: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  preferredLanguage: string;
  voiceStyle: string;
  darkMode: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  isLoading: boolean;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const defaultSettings: AccessibilitySettings = {
  ttsEnabled: false,
  translationEnabled: false,
  highContrast: false,
  dyslexiaFont: false,
  preferredLanguage: 'en',
  voiceStyle: 'neutral',
  darkMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');
  const [liveRegionPriority, setLiveRegionPriority] = useState<'polite' | 'assertive'>('polite');
  const { toast } = useToast();

  // Load settings from Supabase when user changes
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // No user = use defaults, no DB query needed
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('accessibility_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading accessibility settings:', error);
          return;
        }

        if (data) {
          setSettings({
            ttsEnabled: data.tts_enabled,
            translationEnabled: data.translation_enabled,
            highContrast: data.high_contrast,
            dyslexiaFont: data.dyslexia_font,
            preferredLanguage: data.preferred_language,
            voiceStyle: data.voice_style,
            darkMode: data.dark_mode || false,
          });
        }
      } catch (error) {
        console.error('Error in loadSettings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, authLoading]);

  const updateSettings = async (updates: Partial<AccessibilitySettings>) => {
    // Always update local settings immediately
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    // Only persist to database if user is authenticated
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase
        .from('accessibility_settings')
        .upsert({
          user_id: user.id,
          tts_enabled: newSettings.ttsEnabled,
          translation_enabled: newSettings.translationEnabled,
          high_contrast: newSettings.highContrast,
          dyslexia_font: newSettings.dyslexiaFont,
          preferred_language: newSettings.preferredLanguage,
          voice_style: newSettings.voiceStyle,
          dark_mode: newSettings.darkMode,
        });

      if (error) {
        console.error('Error saving accessibility settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to save accessibility settings.',
          variant: 'destructive',
        });
        // Revert settings on error
        setSettings(settings);
      }
    } catch (error) {
      console.error('Error in updateSettings:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setLiveRegionPriority(priority);
    setLiveRegionMessage(message);
    // Clear the message after it's been announced
    setTimeout(() => setLiveRegionMessage(''), 100);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, isLoading, announce }}>
      <div
        className={`
          ${settings.highContrast ? 'accessibility-high-contrast' : ''}
          ${settings.dyslexiaFont ? 'font-opendyslexic' : ''}
        `}
      >
        {/* ARIA live regions for screen reader announcements */}
        <div 
          role="status" 
          aria-live={liveRegionPriority} 
          aria-atomic="true" 
          className="sr-only"
        >
          {liveRegionMessage}
        </div>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
