
import React from 'react';

interface WordHighlighterProps {
  textParts: string[];
  wordPositions: number[];
  currentWordIndex: number;
}

const WordHighlighter: React.FC<WordHighlighterProps> = ({
  textParts,
  wordPositions,
  currentWordIndex,
}) => {
  return (
    <div className="leading-relaxed">
      {textParts.map((part, index) => {
        // Skip whitespace parts for highlighting logic
        if (part.match(/^\s+$/)) {
          return <span key={index} className="invisible">{part}</span>;
        }
        
        // Find if this text part position matches the current highlighted word
        const wordPositionIndex = wordPositions.indexOf(index);
        const isCurrentWord = wordPositionIndex === currentWordIndex;
        
        return (
          <span
            key={index}
            className={`${
              isCurrentWord
                ? 'bg-yellow-400/80 font-medium shadow-sm px-1 py-0.5 rounded-sm border-2 border-yellow-500/60'
                : 'invisible'
            } transition-all duration-200 inline-block`}
          >
            {isCurrentWord ? part : ''}
          </span>
        );
      })}
    </div>
  );
};

export default WordHighlighter;
