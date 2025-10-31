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
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text,
          voiceId: '9BWtsMINqrJLrRacOk9x', // Aria voice
          rate: 1.0,
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

      if (data?.audioBase64) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
        
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
