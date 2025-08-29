
import React from 'react';
import WordHighlighter from './WordHighlighter';
import { useHighlightedSpeech } from '@/hooks/useHighlightedSpeech';

interface HighlightedTextReaderProps {
  text: string;
  className?: string;
}

const HighlightedTextReader: React.FC<HighlightedTextReaderProps> = ({ text, className }) => {
  const {
    currentWordIndex,
    textParts,
    wordPositions,
  } = useHighlightedSpeech(text);

  return (
    <div className={className}>      
      <WordHighlighter
        textParts={textParts}
        wordPositions={wordPositions}
        currentWordIndex={currentWordIndex}
      />
    </div>
  );
};

export default HighlightedTextReader;
