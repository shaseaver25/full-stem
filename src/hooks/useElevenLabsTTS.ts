import { useRef, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPreferences } from './useUserPreferences';
import { segmentWords, calculateWordWeight } from '@/utils/segment';
import { synthesizeTimings, groupTimingsIntoSentences } from '@/utils/timing';
import { WordTiming, TTSOptions } from '@/types/tts';

type SpeakOpts = TTSOptions;

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
  const [wordTimings, setWordTimings] = useState<WordTiming[] | null>(null);

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
          voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL', // Default to Sarah - fixed parameter name
          language: language, // Pass language for multilingual support
          rate: textSpeed === 'Slow' ? 0.8 : textSpeed === 'Fast' ? 1.3 : 1.0
        }
      });

      // Check for quota exceeded error and fallback to browser TTS
      if (error?.message?.includes('quota_exceeded') || error?.message?.includes('401') || 
          data?.error?.includes('quota_exceeded') || data?.error?.includes('401')) {
        console.warn('ElevenLabs quota exceeded, falling back to browser TTS');
        
        // Use browser's Web Speech API as fallback
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = textSpeed === 'Slow' ? 0.8 : textSpeed === 'Fast' ? 1.3 : 1.0;
          
          utterance.onstart = () => {
            setIsPlaying(true);
            setIsLoading(false);
          };
          
          utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
          };
          
          utterance.onerror = (event) => {
            console.error('Browser TTS error:', event);
            setIsPlaying(false);
            setError('Speech playback failed');
            setIsLoading(false);
          };
          
          window.speechSynthesis.speak(utterance);
          return; // Exit early after starting browser TTS
        } else {
          throw new Error('ElevenLabs credits exhausted and browser speech not available');
        }
      }

      if (error) {
        console.error('Supabase function error:', error);
        // Provide more detailed error messages
        if (error.message?.includes('Failed to send a request')) {
          throw new Error('Failed to connect to speech service. Please check your internet connection and try again.');
        } else if (error.message?.includes('MISSING_SECRET')) {
          throw new Error('Speech service is not properly configured. Please contact support.');
        } else if (error.message?.includes('VENDOR_ERROR')) {
          throw new Error('Speech generation service is temporarily unavailable. Please try again in a moment.');
        }
        throw new Error(`Failed to generate speech: ${error.message || 'Unknown error'}`);
      }

      console.log('ElevenLabs TTS response received:', { hasAudio: !!data?.audioBase64, dataKeys: Object.keys(data || {}) });

      const { audioBase64, wordTimings: serverTimings, tokens, weights } = data;

      if (!audioBase64) {
        console.error('No audioBase64 in response:', data);
        throw new Error('No audio content received');
      }

      // Always prepare a LOCAL fallback from the input text (so we don't depend on the server)
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

      // Set consistent playback rate based on user preference
      switch (textSpeed) {
        case 'Slow':
          audio.playbackRate = 0.8;
          break;
        case 'Fast':
          audio.playbackRate = 1.2;
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
        const actualDuration = audio.duration;
        setDuration(actualDuration);
        console.log('Audio duration:', actualDuration, 'Playback rate:', audio.playbackRate);
        
        // Calculate adjusted duration based on playback rate
        const adjustedDuration = actualDuration * audio.playbackRate;
        
        // Prefer precise server timings if provided
        if (serverTimings?.length) {
          // Scale server timings based on playback rate
          const scaledTimings = serverTimings.map(timing => ({
            ...timing,
            start: timing.start * audio.playbackRate,
            end: timing.end * audio.playbackRate
          }));
          // Group word timings into sentence timings
          const sentenceTimings = groupTimingsIntoSentences(scaledTimings);
          setWordTimings(sentenceTimings);
          return;
        }
        // Otherwise synthesize per-word timings using adjusted duration
        const syntheticTimings = synthesizeTimings(localTokens, localWeights, adjustedDuration);
        // Group synthetic timings into sentence timings
        const sentenceTimings = groupTimingsIntoSentences(syntheticTimings);
        setWordTimings(sentenceTimings);
      };

      audio.onplay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
        setIsPaused(false);
        
         // Start time tracking for word highlighting
         timeUpdateIntervalRef.current = setInterval(() => {
           if (audio && !audio.paused) {
             setCurrentTime(audio.currentTime);
           }
         }, 50); // Update every 50ms for responsive highlighting
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
       }, 50); // Update every 50ms for responsive highlighting
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