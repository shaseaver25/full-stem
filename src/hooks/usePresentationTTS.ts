import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useToast } from '@/hooks/use-toast';
import { WordTiming } from '@/types/tts';

export function usePresentationTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const { settings } = useAccessibility();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();

  const updateCurrentWord = () => {
    if (!audioRef.current || !isPlaying) return;
    
    const currentTime = audioRef.current.currentTime * 1000; // Convert to ms
    const index = wordTimings.findIndex(
      (timing, i) => {
        const nextTiming = wordTimings[i + 1];
        return currentTime >= timing.start && (!nextTiming || currentTime < nextTiming.start);
      }
    );
    
    setCurrentWordIndex(index);
    animationFrameRef.current = requestAnimationFrame(updateCurrentWord);
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateCurrentWord);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setCurrentWordIndex(-1);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, wordTimings]);

  const speak = async (text: string) => {
    if (!text || text.trim().length === 0) {
      return;
    }

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);
    setCurrentWordIndex(-1);
    setWordTimings([]);

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

      if (data?.audioBase64 && data?.tokens) {
        // Store word timings
        const timings: WordTiming[] = data.tokens.map((token: any, index: number) => ({
          start: token.start_time || 0,
          end: token.end_time || 0,
          index,
          text: token.text || '',
        }));
        setWordTimings(timings);

        const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
        audioRef.current = audio;
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentWordIndex(-1);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentWordIndex(-1);
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
    currentWordIndex,
    wordTimings,
  };
}
