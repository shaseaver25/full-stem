import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useToast } from '@/hooks/use-toast';

export function useTranslation(forceEnabled = false) {
  const [isTranslating, setIsTranslating] = useState(false);
  const { settings } = useAccessibility();
  const { toast } = useToast();

  const translate = useCallback(async (text: string): Promise<string> => {
    console.log('🔤 useTranslation.translate called:', {
      forceEnabled,
      translationEnabled: settings.translationEnabled,
      preferredLanguage: settings.preferredLanguage,
      textLength: text?.length
    });
    
    if (!forceEnabled && (!settings.translationEnabled || settings.preferredLanguage === 'en')) {
      console.log('🔤 Translation skipped - conditions not met');
      return text;
    }
    
    console.log('🔤 Proceeding with translation to:', settings.preferredLanguage);

    if (!text || text.trim().length === 0) {
      return text;
    }

    setIsTranslating(true);

    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text,
          targetLanguage: settings.preferredLanguage,
          sourceLanguage: 'auto',
        },
      });

      if (error) {
        console.error('Translation error:', error);
        toast({
          title: 'Translation Error',
          description: 'Failed to translate content. Showing original text.',
          variant: 'destructive',
        });
        return text;
      }

      return data?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [settings.translationEnabled, settings.preferredLanguage, toast, forceEnabled]);

  return {
    translate,
    isTranslating,
    isEnabled: forceEnabled || settings.translationEnabled,
  };
}
