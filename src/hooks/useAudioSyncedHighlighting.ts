import { useMemo } from 'react';

export const useAudioSyncedHighlighting = (text: string, currentTime: number, duration: number) => {
  // Split text into words, keeping spaces separate for proper rendering
  const textParts = text.split(/(\s+)/);
  
  // Create a mapping of word positions for highlighting
  const wordPositions: number[] = [];
  textParts.forEach((part, index) => {
    if (!part.match(/^\s*$/)) { // If it's not just whitespace
      wordPositions.push(index);
    }
  });

  // Calculate current word index based on audio progress
  const currentWordIndex = useMemo(() => {
    if (!duration || duration === 0 || !currentTime) return -1;
    
    const progress = currentTime / duration;
    const totalWords = wordPositions.length;
    
    if (progress >= 1) return -1; // Finished reading
    
    const wordIndex = Math.floor(progress * totalWords);
    return Math.min(wordIndex, totalWords - 1);
  }, [currentTime, duration, wordPositions.length]);

  return {
    textParts,
    wordPositions,
    currentWordIndex,
  };
};
