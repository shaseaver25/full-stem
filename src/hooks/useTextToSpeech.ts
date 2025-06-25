
import { useState, useRef, useCallback, useEffect } from 'react';
import { useUserPreferences } from './useUserPreferences';

export const useTextToSpeech = () => {
  const { preferences } = useUserPreferences();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Always enable text-to-speech functionality
  const isEnabled = true;

  const speak = useCallback((text: string) => {
    if (!text.trim()) return;

    console.log('Starting to speak text:', text.substring(0, 100) + '...');

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set speech rate based on user preference, with fallback
    const textSpeed = preferences?.['Text Speed'] || 'Normal';
    switch (textSpeed) {
      case 'Slow':
        utterance.rate = 0.7;
        break;
      case 'Fast':
        utterance.rate = 1.3;
        break;
      default:
        utterance.rate = 1.0;
    }

    utterance.onstart = () => {
      console.log('Speech started');
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [preferences]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isEnabled,
  };
};
