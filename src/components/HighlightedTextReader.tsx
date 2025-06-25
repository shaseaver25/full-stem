
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface HighlightedTextReaderProps {
  text: string;
  className?: string;
}

const HighlightedTextReader: React.FC<HighlightedTextReaderProps> = ({ text, className }) => {
  const { preferences } = useUserPreferences();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Split text into words
  const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  const speak = () => {
    if (!text.trim()) return;

    console.log('Starting highlighted text reading:', text.substring(0, 100) + '...');

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
      console.log('Highlighted speech started');
      setIsPlaying(true);
      setIsPaused(false);
      startWordHighlighting(utterance.rate);
    };

    utterance.onend = () => {
      console.log('Highlighted speech ended');
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      clearTimeouts();
    };

    utterance.onerror = (event) => {
      console.error('Highlighted speech error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      clearTimeouts();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startWordHighlighting = (rate: number) => {
    // Estimate words per minute based on speech rate
    const baseWPM = 150; // Average speaking speed
    const adjustedWPM = baseWPM * rate;
    const msPerWord = (60 / adjustedWPM) * 1000;

    words.forEach((word, index) => {
      const timeout = setTimeout(() => {
        if (isPlaying && !isPaused) {
          setCurrentWordIndex(index);
        }
      }, index * msPerWord);
      
      timeoutsRef.current.push(timeout);
    });
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      clearTimeouts();
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      // Resume highlighting from current position
      if (utteranceRef.current) {
        startWordHighlighting(utteranceRef.current.rate);
      }
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    clearTimeouts();
  };

  const handleClick = () => {
    console.log('Highlighted ReadAloud button clicked');
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak();
    }
  };

  const getIcon = () => {
    if (isPlaying && !isPaused) {
      return <Pause className="h-4 w-4" />;
    } else if (isPaused) {
      return <Play className="h-4 w-4" />;
    } else {
      return <Volume2 className="h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    if (isPlaying && !isPaused) {
      return 'Pause';
    } else if (isPaused) {
      return 'Resume';
    } else {
      return 'Read Aloud';
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      clearTimeouts();
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          className="flex items-center gap-2"
        >
          {getIcon()}
          {getButtonText()}
        </Button>
        {(isPlaying || isPaused) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={stop}
            className="p-2"
            title="Stop reading"
          >
            <VolumeX className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-800 leading-relaxed">
          {words.map((word, index) => (
            <span
              key={index}
              className={`${
                index === currentWordIndex
                  ? 'bg-yellow-300 font-semibold transition-colors duration-200'
                  : ''
              }`}
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

export default HighlightedTextReader;
