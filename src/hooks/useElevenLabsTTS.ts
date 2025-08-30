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
  const syncCheckRef = useRef<{ lastSyncCheck: number; syncPoints: number[] }>({ lastSyncCheck: 0, syncPoints: [] });

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

      // Adjust playback rate based on user preference (optimized for highlighting sync)
      switch (textSpeed) {
        case 'Slow':
          audio.playbackRate = 0.8;
          break;
        case 'Fast':
          audio.playbackRate = 1.2;
          break;
        default:
          audio.playbackRate = 0.95; // Slightly slower than normal for better word sync
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
          // Identify sync points (end of sentences/paragraphs)
          syncCheckRef.current.syncPoints = serverTimings
            .map((timing, i) => ({ ...timing, i }))
            .filter(timing => /[.!?]$/.test(timing.text.trim()) || timing.text.includes('\n'))
            .map(timing => timing.end);
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
        
        // Identify sync points for synthetic timings
        syncCheckRef.current.syncPoints = synthetic
          .filter(timing => /[.!?]$/.test(timing.text.trim()) || timing.text.includes('\n'))
          .map(timing => timing.end);
      };

      audio.onplay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
        setIsPaused(false);
        
         // Start time tracking for word highlighting sync - aggressive correction
         timeUpdateIntervalRef.current = setInterval(() => {
           if (audio && !audio.paused) {
             const currentAudioTime = audio.currentTime;
             setCurrentTime(currentAudioTime);
             
             // Apply sync correction every update
             adjustPlaybackForSync(audio, currentAudioTime);
           }
         }, 50); // Check every 50ms for very responsive sync
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

  // Dynamic sync correction function - simplified and more effective
  const adjustPlaybackForSync = useCallback((audio: HTMLAudioElement, currentAudioTime: number) => {
    if (!wordTimings || wordTimings.length === 0) return;
    
    // Find which word should be highlighted right now based on audio time
    const expectedWordIndex = wordTimings.findIndex(
      timing => currentAudioTime >= timing.start && currentAudioTime <= timing.end
    );
    
    // If we're between words or at the end, don't adjust
    if (expectedWordIndex === -1) return;
    
    // Calculate how far we are through the current word (0 to 1)
    const currentWord = wordTimings[expectedWordIndex];
    const progressThroughWord = (currentAudioTime - currentWord.start) / (currentWord.end - currentWord.start);
    
    // If we're moving too fast through words, slow down
    if (progressThroughWord > 0.8) {  // Near end of word, slow down to let highlighting catch up
      audio.playbackRate = getBasePlaybackRate() * 0.6;
      console.log(`Slowing down to ${audio.playbackRate} - progress: ${progressThroughWord.toFixed(2)}`);
    }
    // If we're moving too slow, speed up slightly
    else if (progressThroughWord < 0.1 && currentAudioTime > currentWord.start + 0.1) {
      audio.playbackRate = getBasePlaybackRate() * 1.1;
      console.log(`Speeding up to ${audio.playbackRate} - progress: ${progressThroughWord.toFixed(2)}`);
    }
    // Normal rate when we're in the middle of a word
    else if (progressThroughWord >= 0.1 && progressThroughWord <= 0.8) {
      audio.playbackRate = getBasePlaybackRate();
    }
  }, [wordTimings, preferences]);

  // Helper to get base playback rate from user preferences
  const getBasePlaybackRate = useCallback(() => {
    const textSpeed = preferences?.['Text Speed'] || 'Normal';
    switch (textSpeed) {
      case 'Slow': return 0.8;
      case 'Fast': return 1.2;
      default: return 0.95;
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
      
       // Restart time tracking with sync correction
       timeUpdateIntervalRef.current = setInterval(() => {
         if (audioRef.current && !audioRef.current.paused) {
           const currentAudioTime = audioRef.current.currentTime;
           setCurrentTime(currentAudioTime);
           adjustPlaybackForSync(audioRef.current, currentAudioTime);
         }
       }, 50); // Check every 50ms for very responsive sync
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
    // Reset sync tracking
    syncCheckRef.current = { lastSyncCheck: 0, syncPoints: [] };
  }, []);

  const seek = useCallback((targetTime: number) => {
    if (!audioRef.current) return;
    
    // Clamp to valid range
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