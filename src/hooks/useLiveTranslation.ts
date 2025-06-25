
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export const useLiveTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());
  const { user } = useAuth();

  const translateText = async ({ text, targetLanguage, sourceLanguage = 'auto' }: TranslationRequest): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use translation features.",
        variant: "destructive",
      });
      return null;
    }

    // Check cache first
    const cacheKey = `${text}_${targetLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setIsTranslating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text,
          targetLanguage,
          sourceLanguage
        }
      });

      if (error) {
        console.error('Translation error:', error);
        toast({
          title: "Translation Error",
          description: "Failed to translate text. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const translatedText = data?.translatedText || text;
      
      // Cache the result
      setTranslationCache(prev => new Map(prev.set(cacheKey, translatedText)));
      
      toast({
        title: "Translation Complete",
        description: `Text translated to ${targetLanguage}`,
      });

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  const clearCache = () => {
    setTranslationCache(new Map());
  };

  return {
    translateText,
    isTranslating,
    clearCache,
  };
};
