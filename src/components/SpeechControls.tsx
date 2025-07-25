
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface SpeechControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({
  isPlaying,
  isPaused,
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

  return (
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
          onClick={onStop}
          className="p-2"
          title="Stop reading"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SpeechControls;
