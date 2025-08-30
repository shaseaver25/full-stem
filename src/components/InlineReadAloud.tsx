import React from 'react';
import DOMPurify from 'dompurify';
import SpeechControls from './SpeechControls';
import { useInPlaceWordHighlighter } from '@/hooks/useInPlaceWordHighlighter';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

interface InlineReadAloudProps {
  text: string;       // HTML string
  className?: string;
  language?: string;  // Language for TTS
}

const InlineReadAloud: React.FC<InlineReadAloudProps> = ({ text, className, language }) => {
  // Sanitize HTML input
  const sanitizedHTML = React.useMemo(() => {
    if (typeof window === 'undefined') return text;
    return DOMPurify.sanitize(text, { USE_PROFILES: { html: true } });
  }, [text]);

  // Extract clean text from sanitized HTML for TTS
  const cleanText = React.useMemo(() => {
    if (typeof window === 'undefined') {
      // Fallback for SSR - basic text extraction
      return text.replace(/<[^>]*>/g, '');
    }
    const temp = document.createElement('div');
    temp.innerHTML = sanitizedHTML;
    return temp.textContent || temp.innerText || '';
  }, [sanitizedHTML, text]);

  // ElevenLabs TTS hook
  const {
    speak: elevenLabsSpeak,
    pause: elevenLabsPause,
    resume: elevenLabsResume,
    stop: elevenLabsStop,
    isPlaying: elevenLabsPlaying,
    isPaused: elevenLabsPaused,
    isLoading: elevenLabsLoading,
    currentTime,
    duration,
    error,
    wordTimings
  } = useElevenLabsTTS(language);

  const isPlaying = elevenLabsPlaying;
  const isPaused = elevenLabsPaused;

  // Container ref for in-place highlighting
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Use in-place word highlighter (no HTML rebuilds)
  const { currentWordIndex } = useInPlaceWordHighlighter(
    contentRef,
    wordTimings ?? [],
    currentTime,
    isPlaying || isPaused // keep highlight while paused
  );

  // Keep current highlighted word centered in view
  React.useEffect(() => {
    if (!contentRef.current || currentWordIndex === -1) return;
    
    const el = contentRef.current.querySelector<HTMLElement>('[data-word-highlight="true"]');
    if (el) {
      // Avoid janky jumps if already in view
      const rect = el.getBoundingClientRect();
      const parent = contentRef.current.getBoundingClientRect();
      const inView = rect.top >= parent.top && rect.bottom <= parent.bottom;
      if (!inView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentWordIndex]);

  const handlePlay = async () => {
    await elevenLabsSpeak(cleanText);
  };

  const handlePause = () => elevenLabsPause();
  const handleResume = () => elevenLabsResume();
  const handleStop = () => elevenLabsStop();

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Controls */}
      <div className="flex justify-end">
        <SpeechControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          isLoading={elevenLabsLoading}
          error={error}
          onPlay={handlePlay}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="prose max-w-none max-h-96 overflow-y-auto"
        aria-live="polite"
        aria-atomic="true"
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </div>
  );
};

export default InlineReadAloud;
