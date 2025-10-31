import { WordTiming } from '@/types/tts';

interface HighlightedTextProps {
  text: string;
  currentWordIndex: number;
  wordTimings: WordTiming[];
}

export function HighlightedText({ text, currentWordIndex, wordTimings }: HighlightedTextProps) {
  if (!wordTimings.length) {
    return <span>{text}</span>;
  }

  // Split text into words while preserving whitespace
  const words = text.split(/(\s+)/);
  let wordIndex = 0;

  return (
    <span>
      {words.map((word, i) => {
        // Skip whitespace
        if (/^\s+$/.test(word)) {
          return <span key={i}>{word}</span>;
        }

        const isCurrentWord = wordIndex === currentWordIndex;
        const className = isCurrentWord
          ? 'bg-primary text-primary-foreground px-1 rounded transition-colors duration-200'
          : '';
        
        wordIndex++;
        
        return (
          <span key={i} className={className}>
            {word}
          </span>
        );
      })}
    </span>
  );
}
