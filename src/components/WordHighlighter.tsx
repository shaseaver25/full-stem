
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
    <div className="leading-relaxed whitespace-pre-wrap">
      {textParts.map((part, index) => {
        // Handle whitespace parts
        if (part.match(/^\s+$/)) {
          return <span key={index} className="invisible">{part}</span>;
        }
        
        // Find if this text part position matches the current highlighted word
        const wordPositionIndex = wordPositions.indexOf(index);
        const isCurrentWord = wordPositionIndex === currentWordIndex;
        
        if (!isCurrentWord) {
          return <span key={index} className="invisible">{part}</span>;
        }
        
        return (
          <span
            key={index}
            className="bg-yellow-400/90 text-gray-900 font-semibold px-1 py-0.5 rounded-sm shadow-sm border-2 border-yellow-500/80 transition-all duration-200"
          >
            {part}
          </span>
        );
      })}
    </div>
  );
};

export default WordHighlighter;
