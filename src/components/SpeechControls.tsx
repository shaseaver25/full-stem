
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react';

interface SpeechControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading?: boolean;
  error?: string | null;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({
  isPlaying,
  isPaused,
  isLoading = false,
  error,
  onPlay,
  onPause,
  onResume,
  onStop,
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

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {getIcon()}
          {getButtonText()}
        </Button>
        {(isPlaying || isPaused) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="p-2"
            title="Stop reading"
          >
            <VolumeX className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded border border-red-200 max-w-xs text-right">
          {error}
        </div>
      )}
    </div>
  );
};

export default SpeechControls;
