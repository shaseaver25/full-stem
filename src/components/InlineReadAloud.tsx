import React from 'react';
import DOMPurify from 'dompurify';

interface InlineReadAloudProps {
  text: string;       // HTML string
  className?: string;
  language?: string;  // Language for TTS
}

const InlineReadAloud: React.FC<InlineReadAloudProps> = ({ text, className, language }) => {
  // TEMPORARY: Disable read-aloud to prevent blocking errors
  if (typeof window !== 'undefined') {
    const sanitizedHTML = DOMPurify.sanitize(text, { USE_PROFILES: { html: true } });
    return (
      <div 
        className={`prose max-w-none ${className || ''}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    );
  }
  
  // Server-side fallback
  return (
    <div className={`prose max-w-none ${className || ''}`}>
      {text}
    </div>
  );
}

export default InlineReadAloud;
