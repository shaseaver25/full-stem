import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useToast } from '@/hooks/use-toast';
import { WordTiming } from '@/types/tts';

export function usePresentationTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const { settings } = useAccessibility();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();

  const updateCurrentWord = () => {
    if (!audioRef.current || !isPlaying || isPaused) return;
    
    const currentTime = audioRef.current.currentTime * 1000; // Convert to ms
    
    // Find the current word based on timing
    let foundIndex = -1;
    for (let i = 0; i < wordTimings.length; i++) {
      if (currentTime >= wordTimings[i].start) {
        foundIndex = i;
      } else {
        break;
      }
    }
    
    setCurrentWordIndex(foundIndex);
    animationFrameRef.current = requestAnimationFrame(updateCurrentWord);
  };

  useEffect(() => {
    if (isPlaying && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateCurrentWord);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPaused, wordTimings]);

  const pause = () => {
    if (audioRef.current && isPlaying && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  };

  const speak = async (text: string) => {
    if (!text || text.trim().length === 0) {
      return;
    }

    // Stop any existing audio
    stop();

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

      // Check for quota exceeded error and fallback to browser TTS
      if (error || (data?.error && (data.error.includes('quota_exceeded') || data.error.includes('401')))) {
        console.warn('ElevenLabs quota exceeded, falling back to browser TTS');
        toast({
          title: 'Using Browser Voice',
          description: 'ElevenLabs credits exhausted. Using browser text-to-speech instead.',
          variant: 'default',
        });
        
        // Fallback to browser's Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsPaused(false);
        };
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIndex(-1);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIndex(-1);
          toast({
            title: 'Playback Error',
            description: 'Failed to play audio.',
            variant: 'destructive',
          });
        };
        
        window.speechSynthesis.speak(utterance);
        setIsLoading(false);
        return;
      }

      if (error) {
        console.error('TTS error:', error);
        toast({
          title: 'Text-to-Speech Error',
          description: 'Failed to generate audio. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      console.log('TTS Response:', { 
        hasAudio: !!data?.audioBase64, 
        hasTokens: !!data?.tokens,
        tokenCount: data?.tokens?.length 
      });

      if (data?.audioBase64) {
        // Store word timings if available
        if (data?.tokens && Array.isArray(data.tokens)) {
          const timings: WordTiming[] = data.tokens.map((token: any, index: number) => ({
            start: (token.start_time || 0) * 1000, // Convert to ms
            end: (token.end_time || 0) * 1000,
            index,
            text: token.text || '',
          }));
          console.log('Word timings:', timings.slice(0, 5)); // Log first 5 for debugging
          setWordTimings(timings);
        } else {
          console.warn('No word timings available from TTS response');
        }

        const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
        audioRef.current = audio;
        
        audio.onplay = () => {
          setIsPlaying(true);
          setIsPaused(false);
        };
        audio.onpause = () => {
          // Only set paused if we didn't stop the audio
          if (audioRef.current) setIsPaused(true);
        };
        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIndex(-1);
        };
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIndex(-1);
          toast({
            title: 'Playback Error',
            description: 'Failed to play audio.',
            variant: 'destructive',
          });
        };

        try {
          await audio.play();
        } catch (playError) {
          console.error('Failed to start audio playback:', playError);
          toast({
            title: 'Playback Error',
            description: 'Unable to play audio. Please try again.',
            variant: 'destructive',
          });
        }
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
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isLoading,
    currentWordIndex,
    wordTimings,
  };
}
