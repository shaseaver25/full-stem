import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useToast } from '@/hooks/use-toast';

export function usePresentationTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useAccessibility();
  const { toast } = useToast();

  const speak = async (text: string) => {
    if (!text || text.trim().length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          language_code: settings.preferredLanguage || 'en-US',
          voice_style: settings.voiceStyle || 'neutral',
        },
      });

      if (error) {
        console.error('TTS error:', error);
        toast({
          title: 'Text-to-Speech Error',
          description: 'Failed to generate audio. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.audio_base64) {
        const audio = new Audio(`data:${data.audio_mime};base64,${data.audio_base64}`);
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          toast({
            title: 'Playback Error',
            description: 'Failed to play audio.',
            variant: 'destructive',
          });
        };

        await audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    speak,
    isPlaying,
    isLoading,
  };
}
