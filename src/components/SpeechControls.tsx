
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react';

interface SpeechControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading?: boolean;
  error?: string | null;
  currentTime?: number;
  duration?: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSeek?: (time: number) => void;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({
  isPlaying,
  isPaused,
  isLoading = false,
  error,
  currentTime = 0,
  duration = 0,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSeek,
}) => {
  const handleClick = () => {
    console.log('Highlighted ReadAloud button clicked');
    if (isPlaying && !isPaused) {
      onPause();
    } else if (isPaused) {
      onResume();
    } else {
      onPlay();
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    } else if (isPlaying && !isPaused) {
      return <Pause className="h-4 w-4" />;
    } else if (isPaused) {
      return <Play className="h-4 w-4" />;
    } else {
      return <Volume2 className="h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return 'Loading...';
    } else if (isPlaying && !isPaused) {
      return 'Pause';
    } else if (isPaused) {
      return 'Resume';
    } else {
      return 'Read Aloud';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    // Use Intl.NumberFormat for locale-aware digits
    try {
      const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
      const formattedMins = formatter.format(mins);
      const formattedSecs = formatter.format(secs);
      return `${formattedMins}:${formattedSecs.padStart(2, '0')}`;
    } catch {
      // Fallback for unsupported environments
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    onSeek?.(time);
  };

  const getAriaLabel = () => {
    if (isLoading) {
      return 'Loading read aloud';
    } else if (isPlaying && !isPaused) {
      return 'Pause read aloud';
    } else if (isPaused) {
      return 'Resume read aloud';
    } else {
      return 'Play read aloud';
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div 
        className="flex items-center gap-2"
        role="group" 
        aria-label="Read aloud controls"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm"
          aria-label={getAriaLabel()}
        >
          {getIcon()}
          {getButtonText()}
        </Button>
        {(isPlaying || isPaused) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            disabled={isLoading}
            className="p-2"
            aria-label="Stop read aloud"
          >
            <VolumeX className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Seekbar and time display */}
      {duration > 0 && !isNaN(duration) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="tabular-nums text-muted-foreground min-w-[40px] text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="w-32 h-1 bg-secondary rounded-lg appearance-none cursor-pointer slider"
            aria-label="Seek to position in audio"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentTime / duration) * 100}%, hsl(var(--secondary)) ${(currentTime / duration) * 100}%, hsl(var(--secondary)) 100%)`
            }}
          />
          <span className="tabular-nums text-muted-foreground min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded border border-red-200 max-w-xs text-right">
          {error}
        </div>
      )}
    </div>
  );
};

export default SpeechControls;
