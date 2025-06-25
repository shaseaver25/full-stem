
import React from 'react';
import SpeechControls from './SpeechControls';
import WordHighlighter from './WordHighlighter';
import { useHighlightedSpeech } from '@/hooks/useHighlightedSpeech';

interface HighlightedTextReaderProps {
  text: string;
  className?: string;
}

const HighlightedTextReader: React.FC<HighlightedTextReaderProps> = ({ text, className }) => {
  const {
    isPlaying,
    isPaused,
    currentWordIndex,
    textParts,
    wordPositions,
    speak,
    pause,
    resume,
    stop,
  } = useHighlightedSpeech(text);

  return (
    <div className={`space-y-4 ${className}`}>
      <SpeechControls
        isPlaying={isPlaying}
        isPaused={isPaused}
        onPlay={speak}
        onPause={pause}
        onResume={resume}
        onStop={stop}
      />
      
      <WordHighlighter
        textParts={textParts}
        wordPositions={wordPositions}
        currentWordIndex={currentWordIndex}
      />
    </div>
  );
};

export default HighlightedTextReader;
