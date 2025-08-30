import React from 'react';
import SpeechControls from './SpeechControls';
import WordHighlighter from './WordHighlighter';
import { useHighlightedSpeech } from '@/hooks/useHighlightedSpeech';

interface InlineReadAloudProps {
  text: string;
  className?: string;
}

const InlineReadAloud: React.FC<InlineReadAloudProps> = ({ text, className }) => {
  // Extract clean text from HTML content first
  const cleanText = React.useMemo(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || '';
  }, [text]);

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
  } = useHighlightedSpeech(cleanText);

  const handlePlay = () => {
    speak();
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Speech Controls */}
      <div className="flex justify-end">
        <SpeechControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={handlePlay}
          onPause={pause}
          onResume={resume}
          onStop={stop}
        />
      </div>
      
      {/* Content with word highlighting */}
      <div className="prose max-w-none">
        {isPlaying || isPaused ? (
          <div className="text-gray-800 leading-relaxed text-lg">
            <WordHighlighter
              textParts={textParts}
              wordPositions={wordPositions}
              currentWordIndex={currentWordIndex}
            />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: text }} />
        )}
      </div>
    </div>
  );
};

export default InlineReadAloud;