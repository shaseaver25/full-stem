import { useRef, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPreferences } from './useUserPreferences';

type SpeakOpts = { voiceId?: string; rate?: number };

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
  const [wordTimings, setWordTimings] = useState<Array<{ start: number; end: number; text: string; index: number }> | null>(null);

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
          language: language, // Pass language for multilingual support
          rate: textSpeed === 'Slow' ? 0.8 : textSpeed === 'Fast' ? 1.3 : 1.0
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to generate speech');
      }

      const { audioContent, wordTimings: serverTimings, tokens, weights } = data;

      if (!audioContent) {
        throw new Error('No audio content received');
      }

      // Always prepare a LOCAL fallback from the input text (so we don't depend on the server)
      const localTokens: string[] =
        (tokens && Array.isArray(tokens) && tokens.length > 0)
          ? tokens
          : text.split(/(\s+)/).filter(t => t.trim().length > 0);
      const localWeights: number[] =
        (weights && Array.isArray(weights) && weights.length === localTokens.length)
          ? weights
          : localTokens.map(tok => {
              const w = tok.replace(/[^\p{L}\p{N}]/gu, '').length;
              return w || 1;
            });

      // Create audio element from base64
      const audioBlob = new Blob([
        Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Reset timing states
      setWordTimings(null);

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
        
        // Prefer precise server timings if provided
        if (serverTimings?.length) {
          setWordTimings(serverTimings);
          return;
        }
        // Otherwise synthesize per-word timings across the REAL audio duration
        const total = localWeights.reduce((a, b) => a + b, 0) || 1;
        let acc = 0;
        const synthetic = localWeights.map((w, i) => {
          const start = (acc / total) * audio.duration;
          acc += w;
          const end = (acc / total) * audio.duration;
          return { start, end, text: localTokens[i], index: i };
        });
        setWordTimings(synthetic);
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
        // Ensure audio is ready before attempting to play
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
          await audio.play();
          console.log('ElevenLabs audio started successfully');
        } else {
          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            audio.oncanplaythrough = () => {
              audio.oncanplaythrough = null;
              resolve(void 0);
            };
            audio.onerror = () => {
              audio.onerror = null;
              reject(new Error('Audio failed to load'));
            };
            // Fallback timeout
            setTimeout(() => {
              reject(new Error('Audio load timeout'));
            }, 10000);
          });
          
          await audio.play();
          console.log('ElevenLabs audio started successfully after loading');
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
  }, [preferences]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      // Handle potential autoplay restrictions on resume
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Resume play error:', error);
          if (error.name === 'NotAllowedError') {
            setError('Please click resume again to continue playback');
          }
        });
      }
      
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
    wordTimings,
  };
};