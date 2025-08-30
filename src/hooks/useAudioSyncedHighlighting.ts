import { useMemo, useState, useEffect } from 'react';

export const useAudioSyncedHighlighting = (text: string, currentTime: number, duration: number, isPlaying: boolean) => {
  // Split text into words, keeping spaces separate for proper rendering
  const textParts = text.split(/(\s+)/);
  
  // Create a mapping of word positions for highlighting
  const wordPositions: number[] = [];
  const words: string[] = [];
  textParts.forEach((part, index) => {
    if (!part.match(/^\s*$/)) { // If it's not just whitespace
      wordPositions.push(index);
      words.push(part);
    }
  });

  // Estimate word timing based on word complexity and punctuation
  const wordTimings = useMemo(() => {
    if (!words.length || !duration) return [];
    
    // Calculate relative timing weights for each word
    const weights = words.map(word => {
      let weight = word.length * 0.1; // Base weight on word length
      
      // Add extra time for punctuation pauses
      if (/[.!?]/.test(word)) weight += 0.5; // Sentence endings
      if (/[,;:]/.test(word)) weight += 0.3; // Mid-sentence pauses
      if (/[()"-]/.test(word)) weight += 0.2; // Other punctuation
      
      // Longer words take more time to pronounce
      if (word.length > 6) weight += 0.2;
      if (word.length > 10) weight += 0.3;
      
      return Math.max(weight, 0.3); // Minimum time per word
    });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    // Calculate cumulative time for each word
    let cumulativeTime = 0;
    return weights.map(weight => {
      cumulativeTime += (weight / totalWeight) * duration;
      return cumulativeTime;
    });
  }, [words, duration]);

  // Calculate current word index based on more sophisticated timing
  const currentWordIndex = useMemo(() => {
    if (!isPlaying || !wordTimings.length || currentTime <= 0) return -1;
    
    // Find the word that should be currently spoken
    for (let i = 0; i < wordTimings.length; i++) {
      if (currentTime <= wordTimings[i]) {
        return i;
      }
    }
    
    // If we're past the last word, don't highlight anything
    return -1;
  }, [currentTime, wordTimings, isPlaying]);

  return {
    textParts,
    wordPositions,
    currentWordIndex,
  };
};
