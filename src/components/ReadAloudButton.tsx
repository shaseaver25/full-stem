
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ text, className }) => {
  const { speak, pause, resume, stop, isPlaying, isPaused, isEnabled } = useTextToSpeech();

  if (!isEnabled) {
    return null;
  }

  const handleClick = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    stop();
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
    <div className={`flex items-center gap-2 ${className}`}>
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
          onClick={handleStop}
          className="p-2"
          title="Stop reading"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ReadAloudButton;
