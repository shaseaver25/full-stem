import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPreferences } from './useUserPreferences';

export const useElevenLabsTTS = (language?: string) => {
  const { preferences } = useUserPreferences();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isEnabled = true;

  const speak = useCallback(async (text: string, voiceId?: string) => {
    if (!text.trim()) return;

    console.log('Starting ElevenLabs TTS for text:', text.substring(0, 100) + '...');
    setIsLoading(true);
    setError(null);

    try {
      // Stop any current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Get speech rate preference
      const textSpeed = preferences?.['Text Speed'] || 'Normal';
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { 
          text: text,
          voice: voiceId || 'EXAVITQu4vr4xnSDxMaL', // Default to Sarah
          language: language // Pass language for multilingual support
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to generate speech');
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio element from base64
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Adjust playback rate based on user preference
      switch (textSpeed) {
        case 'Slow':
          audio.playbackRate = 0.8;
          break;
        case 'Fast':
          audio.playbackRate = 1.3;
          break;
        default:
          audio.playbackRate = 1.0;
      }

      // Set up event listeners before playing
      audio.onloadstart = () => {
        console.log('Audio loading started');
      };

      audio.oncanplay = () => {
        console.log('Audio can start playing');
        setIsLoading(false);
      };

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        console.log('Audio duration:', audio.duration);
      };

      audio.onplay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
        setIsPaused(false);
        
        // Start time tracking for word highlighting sync
        timeUpdateIntervalRef.current = setInterval(() => {
          if (audio && !audio.paused) {
            setCurrentTime(audio.currentTime);
          }
        }, 100); // Update every 100ms for smooth highlighting
      };

      audio.onpause = () => {
        console.log('Audio paused');
        setIsPaused(true);
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = null;
        }
      };

      audio.onended = () => {
        console.log('Audio ended');
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(0);
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = null;
        }
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error('Audio error:', e);
        setError('Failed to play audio');
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      // Start playing
      try {
        await audio.play();
        console.log('ElevenLabs audio started successfully');
      } catch (playError) {
        console.error('Failed to start audio playback:', playError);
        setError('Failed to start audio playback');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate speech');
      setIsLoading(false);
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [preferences]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      // Restart time tracking
      timeUpdateIntervalRef.current = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
    }
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isLoading,
    isEnabled,
    error,
    currentTime,
    duration,
  };
};