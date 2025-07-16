import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Download, Settings, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedReadAloudProps {
  text: string;
  className?: string;
  autoHighlight?: boolean;
  showControls?: boolean;
  theme?: 'light' | 'dark';
}

interface WordToken {
  word: string;
  start: number;
  end: number;
  index: number;
}

const GOOGLE_TTS_VOICES = [
  { value: 'en-US-WaveNet-D', label: 'Emma (Female, Clear)' },
  { value: 'en-US-WaveNet-A', label: 'Michael (Male, Warm)' },
  { value: 'en-US-WaveNet-B', label: 'David (Male, Deep)' },
  { value: 'en-US-WaveNet-C', label: 'Sarah (Female, Friendly)' },
  { value: 'en-US-WaveNet-E', label: 'Ava (Female, Professional)' },
  { value: 'en-US-WaveNet-F', label: 'James (Male, Authoritative)' },
];

export const EnhancedReadAloud: React.FC<EnhancedReadAloudProps> = ({
  text,
  className = '',
  autoHighlight = true,
  showControls = true,
  theme = 'light'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('en-US-WaveNet-D');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wordTokens, setWordTokens] = useState<WordToken[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Tokenize text into words with positions
  const tokenizeText = useCallback((inputText: string): WordToken[] => {
    const words: WordToken[] = [];
    const wordRegex = /\b\w+\b/g;
    let match;
    let index = 0;

    while ((match = wordRegex.exec(inputText)) !== null) {
      words.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        index: index++
      });
    }

    return words;
  }, []);

  // Initialize word tokens when text changes
  useEffect(() => {
    if (text) {
      const tokens = tokenizeText(text);
      setWordTokens(tokens);
    }
  }, [text, tokenizeText]);

  // Generate audio using Web Speech API (enhanced fallback)
  const generateAudio = async (textToSpeak: string, voice: string, speed: number) => {
    setIsLoading(true);
    try {
      // Ensure speech synthesis is ready
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported in this browser');
      }

      // Wait for voices to load if they haven't already
      let voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        await new Promise(resolve => {
          speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            resolve(voices);
          };
        });
      }

      // Stop any existing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = speed;
      utterance.volume = 1;
      utterance.pitch = 1;
      
      // Try to find the best available voice
      const preferredVoice = voices.find(v => 
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('neural') ||
        (v.lang.startsWith('en-US') && !v.localService)
      ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Using voice:', preferredVoice.name);
      }

      return new Promise<void>((resolve, reject) => {
        utterance.onstart = () => {
          console.log('Speech started');
          setIsPlaying(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          console.log('Speech ended');
          setIsPlaying(false);
          setIsPaused(false);
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech error:', event);
          setIsPlaying(false);
          setIsPaused(false);
          reject(new Error('Speech synthesis failed'));
        };

        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Audio generation failed:', error);
      toast({
        title: "Audio Generation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Word highlighting logic based on audio timing
  const startWordTracking = useCallback(() => {
    if (!wordTokens.length) return;

    const totalDuration = text.length * 60; // Estimate: 60ms per character
    const wordDuration = totalDuration / wordTokens.length;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= wordTokens.length) {
        clearInterval(interval);
        setCurrentWordIndex(-1);
        setIsPlaying(false);
        return;
      }

      setCurrentWordIndex(currentIndex);
      currentIndex++;
    }, wordDuration / playbackSpeed);

    timeUpdateIntervalRef.current = interval;
  }, [wordTokens, text.length, playbackSpeed]);

  const handlePlay = async () => {
    console.log('HandlePlay called, isPaused:', isPaused, 'isPlaying:', isPlaying);
    
    if (isPaused) {
      // Resume from pause
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startWordTracking();
      return;
    }

    try {
      console.log('Starting new playback');
      setIsPlaying(true);
      setCurrentWordIndex(0);
      
      // Start word tracking first
      if (autoHighlight) {
        startWordTracking();
      }
      
      // Then start audio
      await generateAudio(text, selectedVoice, playbackSpeed);
      
      console.log('Playback completed');
    } catch (error) {
      console.error('Playback failed:', error);
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      toast({
        title: "Playback Failed",
        description: "Please try again or check your internet connection",
        variant: "destructive"
      });
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsPlaying(false);
    speechSynthesis.pause();
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    speechSynthesis.cancel();
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
  };

  const handleSpeedChange = (newSpeed: number[]) => {
    setPlaybackSpeed(newSpeed[0]);
  };

  const downloadTranscript = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render text with word highlighting
  const renderHighlightedText = () => {
    if (!autoHighlight || !wordTokens.length) {
      return <div className="prose prose-lg max-w-none leading-relaxed">{text}</div>;
    }

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    wordTokens.forEach((token, index) => {
      // Add text before the word
      if (token.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, token.start)}
          </span>
        );
      }

      // Add the highlighted word
      const isActive = currentWordIndex === token.index;
      elements.push(
        <span
          key={`word-${index}`}
          className={`transition-all duration-300 rounded-sm px-1 ${
            isActive
              ? 'bg-primary/20 text-primary font-semibold scale-105 shadow-sm'
              : 'hover:bg-muted/50'
          }`}
          style={{
            transformOrigin: 'center',
            display: 'inline-block'
          }}
        >
          {token.word}
        </span>
      );

      lastIndex = token.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div className="prose prose-lg max-w-none leading-relaxed text-foreground">
        {elements}
      </div>
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className={`space-y-6 p-6 rounded-lg border bg-card ${className}`}>
      {/* Controls */}
      {showControls && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={isLoading || !text.trim()}
              size="sm"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
            </Button>

            {(isPlaying || isPaused) && (
              <Button
                onClick={handleStop}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Speed:</span>
            <Slider
              value={[playbackSpeed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-20"
            />
            <span className="text-sm font-mono w-8">{playbackSpeed.toFixed(1)}x</span>
          </div>

          {/* Voice Selection */}
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_TTS_VOICES.map((voice) => (
                <SelectItem key={voice.value} value={voice.value}>
                  {voice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Additional Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                // Quick test to ensure speech works
                const testUtterance = new SpeechSynthesisUtterance('Testing audio');
                testUtterance.volume = 0.5;
                testUtterance.rate = 1;
                speechSynthesis.speak(testUtterance);
              }}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              🔊 Test Audio
            </Button>
            <Button
              onClick={downloadTranscript}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      )}

      {/* Text Content with Highlighting */}
      <div className="relative">
        {/* Reading Progress Indicator */}
        {isPlaying && wordTokens.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Reading Progress</span>
              <span>{Math.round((currentWordIndex / wordTokens.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentWordIndex / wordTokens.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Highlighted Text */}
        <div className="relative">
          {renderHighlightedText()}
          
          {/* Animated Reading Pointer (Optional) */}
          {isPlaying && currentWordIndex >= 0 && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10
              }}
            >
              <div className="animate-bounce text-primary">
                ⬇️
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isPlaying && currentWordIndex >= 0 && wordTokens[currentWordIndex] && (
          `Currently reading: ${wordTokens[currentWordIndex].word}`
        )}
      </div>
    </div>
  );
};

export default EnhancedReadAloud;