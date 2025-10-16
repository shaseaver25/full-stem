
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TranslationContextType {
  isTranslating: boolean;
  currentLanguage: string | null;
  translatedContent: Map<string, string>;
  translateContent: (content: string, targetLanguage: string, contentId?: string) => Promise<string | null>;
  clearTranslations: () => void;
  setCurrentLanguage: (language: string | null) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useRealTimeTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useRealTimeTranslation must be used within a RealTimeTranslationProvider');
  }
  return context;
};

interface RealTimeTranslationProviderProps {
  children: React.ReactNode;
}

export const RealTimeTranslationProvider: React.FC<RealTimeTranslationProviderProps> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const { translateText, isTranslating, clearCache } = useLiveTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<Map<string, string>>(new Map());

  const translateContent = useCallback(async (
    content: string, 
    targetLanguage: string, 
    contentId?: string
  ): Promise<string | null> => {
    // Check if we already have this translation cached
    const cacheKey = `${contentId || content.substring(0, 50)}_${targetLanguage}`;
    if (translatedContent.has(cacheKey)) {
      return translatedContent.get(cacheKey)!;
    }

    try {
      const result = await translateText({
        text: content,
        targetLanguage,
        sourceLanguage: 'auto'
      });

      if (result) {
        // Cache the translation
        setTranslatedContent(prev => new Map(prev.set(cacheKey, result)));
        setCurrentLanguage(targetLanguage);
        return result;
      }

      return null;
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Error",
        description: "Failed to translate content. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, translateText, translatedContent]);

  const clearTranslations = useCallback(() => {
    setTranslatedContent(new Map());
    setCurrentLanguage(null);
    clearCache();
  }, [clearCache]);

  const value: TranslationContextType = {
    isTranslating,
    currentLanguage,
    translatedContent,
    translateContent,
    clearTranslations,
    setCurrentLanguage
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
