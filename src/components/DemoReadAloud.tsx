import React, { useState, useMemo } from 'react';
import { useElevenLabsTTSPublic } from '@/hooks/useElevenLabsTTSPublic';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DemoReadAloudProps {
  text: string;
}

const VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (Female)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female)' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (Male)' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (Male)' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily (Female)' },
];

export const DemoReadAloud: React.FC<DemoReadAloudProps> = ({ text }) => {
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
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
  } = useElevenLabsTTSPublic();

  // Split text into words for highlighting
  const words = useMemo(() => {
    return text.split(/\s+/).filter(w => w.length > 0);
  }, [text]);

  // Find current word based on currentTime
  const currentWordIndex = useMemo(() => {
    if (!wordTimings || wordTimings.length === 0 || !isPlaying) return -1;
    
    let foundIndex = -1;
    for (let i = 0; i < wordTimings.length; i++) {
      const timing = wordTimings[i];
      if (currentTime >= timing.start && currentTime < timing.end) {
        foundIndex = i;
        break;
      }
    }
    console.log('Found word index:', foundIndex, 'at time:', currentTime);
    return foundIndex;
  }, [currentTime, wordTimings, isPlaying]);

  // Debug logging
  React.useEffect(() => {
    console.log('=== DEBUG INFO ===');
    console.log('isPlaying:', isPlaying);
    console.log('currentTime:', currentTime);
    console.log('duration:', duration);
    console.log('wordTimings length:', wordTimings?.length);
    console.log('words length:', words.length);
    console.log('currentWordIndex:', currentWordIndex);
    if (wordTimings && wordTimings.length > 0) {
      console.log('First 3 wordTimings:', wordTimings.slice(0, 3));
    }
  }, [isPlaying, currentTime, wordTimings, currentWordIndex, duration, words.length]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      await speak(text, selectedVoice, playbackSpeed);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      {/* Text Display with Highlighting */}
      <div className="bg-card border border-border rounded-lg p-8">
        <p className="text-xl leading-relaxed">
          {words.map((word, index) => {
            const isHighlighted = currentWordIndex === index;
            return (
              <span
                key={index}
                className={`transition-all duration-200 ${
                  isHighlighted
                    ? 'bg-yellow-400/30 text-foreground font-semibold px-1 rounded'
                    : 'text-foreground'
                }`}
              >
                {word}{' '}
              </span>
            );
          })}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Main Play/Pause Button - LARGE */}
        <div className="flex justify-center">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            size="lg"
            className="h-20 w-48 text-xl font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-8 w-8 mr-3 animate-spin" />
                Generating...
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-8 w-8 mr-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-8 w-8 mr-3" />
                {isPaused ? 'Resume' : 'Play'}
              </>
            )}
          </Button>
        </div>

        {/* Stop Button */}
        {(isPlaying || isPaused) && (
          <div className="flex justify-center">
            <Button
              onClick={stop}
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg"
            >
              <Square className="h-6 w-6 mr-2" />
              Stop
            </Button>
          </div>
        )}

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-200"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Voice and Speed Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          {/* Voice Selection */}
          <div className="space-y-3">
            <label className="text-base font-medium flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice
            </label>
            <Select
              value={selectedVoice}
              onValueChange={setSelectedVoice}
              disabled={isPlaying || isLoading}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed Control */}
          <div className="space-y-3">
            <label className="text-base font-medium">
              Speed: {playbackSpeed.toFixed(1)}x
            </label>
            <Slider
              value={[playbackSpeed]}
              onValueChange={(value) => setPlaybackSpeed(value[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              disabled={isPlaying || isLoading}
              className="py-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-base pt-2">
          {isLoading && (
            <>
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Generating audio...</span>
            </>
          )}
          {isPlaying && !isLoading && (
            <>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Playing</span>
            </>
          )}
          {isPaused && (
            <>
              <div className="h-3 w-3 bg-yellow-500 rounded-full" />
              <span className="text-muted-foreground">Paused</span>
            </>
          )}
          {!isPlaying && !isPaused && !isLoading && (
            <>
              <div className="h-3 w-3 bg-muted-foreground/50 rounded-full" />
              <span className="text-muted-foreground">Ready</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoReadAloud;
