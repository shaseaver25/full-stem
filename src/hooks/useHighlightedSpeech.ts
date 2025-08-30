import { useState, useRef, useCallback, useEffect } from 'react';
import { useUserPreferences } from './useUserPreferences';

export const useHighlightedSpeech = (text: string) => {
  const { preferences } = useUserPreferences();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into words, keeping spaces separate for proper rendering
  const textParts = text.split(/(\s+)/);
  // Create a mapping of word positions for highlighting
  const wordPositions: number[] = [];
  textParts.forEach((part, index) => {
    if (!part.match(/^\s*$/)) { // If it's not just whitespace
      wordPositions.push(index);
    }
  });

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startWordHighlighting = useCallback((utterance: SpeechSynthesisUtterance) => {
    let currentIndex = 0;
    setCurrentWordIndex(0);

    // Calculate timing based on speech rate - more conservative approach
    const baseWPM = 120; // Slower base rate to better match speech synthesis
    const adjustedWPM = baseWPM * utterance.rate;
    const msPerWord = (60 / adjustedWPM) * 1000;

    console.log(`Starting word highlighting with ${wordPositions.length} words at ${adjustedWPM} WPM, ${msPerWord}ms per word`);

    // Start highlighting immediately with first word
    intervalRef.current = setInterval(() => {
      if (currentIndex < wordPositions.length - 1) {
        currentIndex++;
        setCurrentWordIndex(currentIndex);
      } else {
        // Clear highlighting after the last word
        setTimeout(() => {
          setCurrentWordIndex(-1);
        }, 1000);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, msPerWord);

  }, [wordPositions]);

  const speak = useCallback(() => {
    if (!text.trim()) return;

    console.log('Starting highlighted text reading');

    // Stop any current speech
    window.speechSynthesis.cancel();
    clearTimeouts();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set speech rate based on user preference
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
      console.log('Highlighted speech started (for timing only)');
      setIsPlaying(true);
      setIsPaused(false);
      startWordHighlighting(utterance);
    };

    // Make browser TTS silent for highlighting only
    utterance.volume = 0;

    utterance.onend = () => {
      console.log('Highlighted speech ended');
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      clearTimeouts();
    };

    utterance.onerror = (event) => {
      console.error('Highlighted speech error:', event);
      // Don't stop highlighting on speech errors - continue the visual feedback
      console.log('Continuing word highlighting despite speech error');
    };

    // Add boundary event to sync with actual speech
    utterance.onboundary = (event) => {
      console.log('Speech boundary event:', event);
    };

    window.speechSynthesis.speak(utterance);
  }, [text, preferences, clearTimeouts, startWordHighlighting]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      // Pause the word highlighting
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      // Resume word highlighting from current position
      if (currentWordIndex >= 0 && currentWordIndex < wordPositions.length && utteranceRef.current) {
        const rate = utteranceRef.current.rate || 1.0;
        const baseWPM = 120;
        const adjustedWPM = baseWPM * rate;
        const msPerWord = (60 / adjustedWPM) * 1000;
        
        let currentIndex = currentWordIndex;
        intervalRef.current = setInterval(() => {
          if (currentIndex < wordPositions.length - 1) {
            currentIndex++;
            setCurrentWordIndex(currentIndex);
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }, msPerWord);
      }
    }
  }, [currentWordIndex, wordPositions.length]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    clearTimeouts();
  }, [clearTimeouts]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    isPlaying,
    isPaused,
    currentWordIndex,
    textParts,
    wordPositions,
    speak,
    pause,
    resume,
    stop,
  };
};
