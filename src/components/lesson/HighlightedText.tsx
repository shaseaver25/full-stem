import { WordTiming } from '@/types/tts';

interface HighlightedTextProps {
  text: string;
  currentWordIndex: number;
  wordTimings: WordTiming[];
}

export function HighlightedText({ text, currentWordIndex, wordTimings }: HighlightedTextProps) {
  if (!wordTimings.length || currentWordIndex === -1) {
    return <span>{text}</span>;
  }

  // Get the actual word from timing data
  const currentWord = wordTimings[currentWordIndex]?.text;
  
  if (!currentWord) {
    return <span>{text}</span>;
  }

  // Find and highlight the word in the text
  const parts = [];
  let lastIndex = 0;
  let searchFrom = 0;
  
  // Try to find each timed word in the text and highlight the current one
  for (let i = 0; i <= currentWordIndex && i < wordTimings.length; i++) {
    const word = wordTimings[i].text.trim();
    if (!word) continue;
    
    const index = text.indexOf(word, searchFrom);
    if (index !== -1) {
      // Add text before this word
      if (index > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>{text.substring(lastIndex, index)}</span>
        );
      }
      
      // Add the word (highlighted if current)
      const isCurrentWord = i === currentWordIndex;
      parts.push(
        <span 
          key={`word-${i}`}
          className={isCurrentWord ? 'bg-primary text-primary-foreground px-1 rounded transition-colors duration-200' : ''}
        >
          {word}
        </span>
      );
      
      lastIndex = index + word.length;
      searchFrom = lastIndex;
    }
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">{text.substring(lastIndex)}</span>
    );
  }
  
  return <>{parts}</>;
}
