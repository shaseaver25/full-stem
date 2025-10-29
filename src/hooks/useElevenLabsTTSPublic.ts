import { useRef, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { segmentWords, calculateWordWeight } from '@/utils/segment';
import { synthesizeTimings, groupTimingsIntoSentences } from '@/utils/timing';
import { WordTiming, TTSOptions } from '@/types/tts';

type SpeakOpts = TTSOptions;

/**
 * Public version of ElevenLabs TTS hook that doesn't require authentication
 * Perfect for demo pages and public showcases
 */
export const useElevenLabsTTSPublic = (language?: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [wordTimings, setWordTimings] = useState<WordTiming[] | null>(null);

  const isEnabled = true;

  const speak = useCallback(async (text: string, voiceId?: string, rate: number = 1.0) => {
    if (!text.trim()) return;

    console.log('Starting ElevenLabs TTS (public) for text:', text.substring(0, 100) + '...');
    setIsLoading(true);
    setError(null);

    try {
      // Stop any current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Call our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { 
          text: text,
          voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL', // Default to Sarah
          language: language,
          rate: rate
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to generate speech: ${error.message || 'Unknown error'}`);
      }

      console.log('ElevenLabs TTS response received:', { hasAudio: !!data?.audioBase64 });

      const { audioBase64, wordTimings: serverTimings, tokens, weights } = data;

      if (!audioBase64) {
        console.error('No audioBase64 in response:', data);
        throw new Error('No audio content received');
      }

      // Prepare local fallback
      const localTokens: string[] =
        (tokens && Array.isArray(tokens) && tokens.length > 0)
          ? tokens
          : segmentWords(text, language);
      const localWeights: number[] =
        (weights && Array.isArray(weights) && weights.length === localTokens.length)
          ? weights
          : localTokens.map(token => calculateWordWeight(token));

      // Create audio element from base64
      const audioBlob = new Blob([
        Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Reset timing states
      setWordTimings(null);

      // Set playback rate
      audio.playbackRate = rate;

      // Set up event listeners
      audio.oncanplay = () => {
        console.log('Audio can start playing');
        setIsLoading(false);
      };

      audio.onloadedmetadata = () => {
        const actualDuration = audio.duration;
        setDuration(actualDuration);
        console.log('Audio duration:', actualDuration, 'Playback rate:', audio.playbackRate);
        
        const adjustedDuration = actualDuration * audio.playbackRate;
        
        if (serverTimings?.length) {
          const scaledTimings = serverTimings.map(timing => ({
            ...timing,
            start: timing.start * audio.playbackRate,
            end: timing.end * audio.playbackRate
          }));
          const sentenceTimings = groupTimingsIntoSentences(scaledTimings);
          setWordTimings(sentenceTimings);
          return;
        }
        const syntheticTimings = synthesizeTimings(localTokens, localWeights, adjustedDuration);
        const sentenceTimings = groupTimingsIntoSentences(syntheticTimings);
        setWordTimings(sentenceTimings);
      };

      audio.onplay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
        setIsPaused(false);
        
        timeUpdateIntervalRef.current = setInterval(() => {
          if (audio && !audio.paused) {
            setCurrentTime(audio.currentTime);
          }
        }, 50);
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
        if (audio.readyState >= 2) {
          await audio.play();
          console.log('Audio started successfully');
        } else {
          await new Promise((resolve, reject) => {
            audio.oncanplaythrough = () => {
              audio.oncanplaythrough = null;
              resolve(void 0);
            };
            audio.onerror = () => {
              audio.onerror = null;
              reject(new Error('Audio failed to load'));
            };
            setTimeout(() => {
              reject(new Error('Audio load timeout'));
            }, 10000);
          });
          
          await audio.play();
          console.log('Audio started successfully after loading');
        }
      } catch (playError: any) {
        console.error('Failed to start audio playback:', playError);
        
        if (playError.name === 'NotAllowedError') {
          setError('Please click the button again to start audio playback');
        } else if (playError.name === 'NotSupportedError') {
          setError('Audio format not supported by your browser');
        } else {
          setError('Failed to start audio playback. Please try again.');
        }
        
        setIsLoading(false);
        setIsPlaying(false);
        setIsPaused(false);
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate speech');
      setIsLoading(false);
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [language]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Resume play error:', error);
          if (error.name === 'NotAllowedError') {
            setError('Please click resume again to continue playback');
          }
        });
      }
      
      timeUpdateIntervalRef.current = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 50);
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

  const seek = useCallback((targetTime: number) => {
    if (!audioRef.current) return;
    
    const clampedTime = Math.max(0, Math.min(targetTime, audioRef.current.duration || 0));
    
    try {
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    } catch (error) {
      console.warn('Seek failed:', error);
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
    seek,
    isPlaying,
    isPaused,
    isLoading,
    isEnabled,
    error,
    currentTime,
    duration,
    wordTimings,
  };
};
