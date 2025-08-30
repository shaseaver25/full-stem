import React from 'react';
import SpeechControls from './SpeechControls';
import { useHTMLWordHighlightingTimed } from '@/hooks/useHTMLWordHighlightingTimed';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

interface InlineReadAloudProps {
  text: string;       // HTML string
  className?: string;
  language?: string;  // Language for TTS
}

const InlineReadAloud: React.FC<InlineReadAloudProps> = ({ text, className, language }) => {
  // Extract clean text from HTML for TTS
  const cleanText = React.useMemo(() => {
    const temp = document.createElement('div');
    temp.innerHTML = text;
    return temp.textContent || temp.innerText || '';
  }, [text]);

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

  // Get HTML with word highlighting applied
  const highlightedHTML = useHTMLWordHighlightingTimed(
    text,
    wordTimings,
    currentTime,
    isPlaying || isPaused // keep highlight while paused
  );

  // Keep current line centered in view
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current.querySelector<HTMLElement>('[data-word-highlight="true"]');
    if (el) {
      // Avoid janky jumps if already in view
      const rect = el.getBoundingClientRect();
      const parent = contentRef.current.getBoundingClientRect();
      const inView = rect.top >= parent.top && rect.bottom <= parent.bottom;
      if (!inView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [highlightedHTML]);

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
      >
        <div
          dangerouslySetInnerHTML={{
            __html: (isPlaying || isPaused) ? highlightedHTML : text,
          }}
        />
      </div>
    </div>
  );
};

export default InlineReadAloud;
