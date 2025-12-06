import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useToast } from '@/hooks/use-toast';

export function useTextToSpeech(forceEnabled = false) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { settings } = useAccessibility();
  const { toast } = useToast();

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  const speak = async (text: string) => {
    if (!forceEnabled && !settings.ttsEnabled) {
      return;
    }

    if (!text || text.trim().length === 0) {
      return;
    }

    // Stop any existing playback before starting new
    stop();

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          language_code: settings.preferredLanguage,
          voice_style: settings.voiceStyle,
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
        audioRef.current = audio;
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          audioRef.current = null;
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
    stop,
    isPlaying,
    isLoading,
    isEnabled: forceEnabled || settings.ttsEnabled,
  };
}
