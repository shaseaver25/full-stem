
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
    <div className="prose prose-lg max-w-none">
      <div className="text-gray-800 leading-relaxed text-lg">
        {textParts.map((part, index) => {
          // Skip whitespace parts for highlighting logic
          if (part.match(/^\s+$/)) {
            return <span key={index}>{part}</span>;
          }
          
          // Find if this text part position matches the current highlighted word
          const wordPositionIndex = wordPositions.indexOf(index);
          const isCurrentWord = wordPositionIndex === currentWordIndex;
          
          return (
            <span
              key={index}
              className={`${
                isCurrentWord
                  ? 'bg-yellow-300 font-semibold transition-all duration-300 px-1 rounded'
                  : ''
              } transition-all duration-200`}
            >
              {part}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default WordHighlighter;
