import React, { useState, useEffect, useMemo } from 'react';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Volume2, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedReadAloudDemoProps {
  text: string;
  className?: string;
}

// ElevenLabs voice options
const VOICE_OPTIONS = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
];

const EnhancedReadAloudDemo: React.FC<EnhancedReadAloudDemoProps> = ({ text, className = '' }) => {
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isLoading,
    error,
    currentTime,
    duration,
    wordTimings,
  } = useElevenLabsTTS();

  // Find current word index based on currentTime
  const currentWordIndex = useMemo(() => {
    if (!wordTimings.length || !isPlaying) return -1;
    
    for (let i = 0; i < wordTimings.length; i++) {
      const timing = wordTimings[i];
      if (currentTime >= timing.start && currentTime <= timing.end) {
        return i;
      }
    }
    return -1;
  }, [currentTime, wordTimings, isPlaying]);

  // Split text into words for highlighting
  const words = useMemo(() => text.split(/(\s+)/).filter(w => w.trim().length > 0), [text]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      await speak(text, selectedVoice);
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleSpeedChange = (value: number[]) => {
    setPlaybackSpeed(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls Section */}
      <Card className="p-4 bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice Selection
            </label>
            <Select
              value={selectedVoice}
              onValueChange={setSelectedVoice}
              disabled={isPlaying || isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICE_OPTIONS.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Speed: {playbackSpeed.toFixed(1)}x
            </label>
            <Slider
              value={[playbackSpeed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              disabled={isPlaying || isLoading}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            size="lg"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                {isPaused ? 'Resume' : 'Play'}
              </>
            )}
          </Button>

          <Button
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            size="lg"
            variant="outline"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop
          </Button>

          <Button
            onClick={() => speak(text, selectedVoice)}
            disabled={isLoading}
            size="lg"
            variant="outline"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-200"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Text Display with Highlighting */}
      <Card className="p-6">
        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed">
            {words.map((word, index) => {
              const isHighlighted = currentWordIndex === index;
              return (
                <span
                  key={index}
                  className={`inline-block transition-all duration-200 ${
                    isHighlighted
                      ? 'bg-primary/20 text-primary font-semibold px-1 rounded scale-105'
                      : ''
                  }`}
                >
                  {word}{' '}
                </span>
              );
            })}
          </p>
        </div>
      </Card>

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        {isPlaying && (
          <>
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span>Playing...</span>
          </>
        )}
        {isPaused && (
          <>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
            <span>Paused</span>
          </>
        )}
        {!isPlaying && !isPaused && !isLoading && (
          <>
            <div className="h-2 w-2 bg-muted-foreground rounded-full" />
            <span>Ready to play</span>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedReadAloudDemo;
