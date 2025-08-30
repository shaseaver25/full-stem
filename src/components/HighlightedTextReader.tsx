
import React from 'react';
import { useHighlightedSpeech } from '@/hooks/useHighlightedSpeech';

interface HighlightedTextReaderProps {
  text: string;
  className?: string;
}

const HighlightedTextReader: React.FC<HighlightedTextReaderProps> = ({ text, className }) => {
  return (
    <div className={className}>
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
      </div>
    </div>
  );
};

export default HighlightedTextReader;
