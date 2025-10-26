import React from 'react';
import DOMPurify from 'dompurify';
import SpeechControls from './SpeechControls';
import { useInPlaceWordHighlighter } from '@/hooks/useInPlaceWordHighlighter';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { normalizeLanguageCode } from '@/utils/segment';
import { ErrorBoundary } from './ui/ErrorBoundary';
import TTSDebugHUD from './debug/TTSDebugHUD';

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
};

export default InlineReadAloud; const normalizedLanguage = normalizeLanguageCode(language);
  // ... rest of the code
  const normalizedLanguage = normalizeLanguageCode(language);
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
    seek: elevenLabsSeek,
    isPlaying: elevenLabsPlaying,
    isPaused: elevenLabsPaused,
    isLoading: elevenLabsLoading,
    currentTime,
    duration,
    error,
    wordTimings
  } = useElevenLabsTTS(normalizedLanguage);

  const isPlaying = elevenLabsPlaying;
  const isPaused = elevenLabsPaused;

  // Container ref for in-place highlighting
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Use in-place word highlighter (no HTML rebuilds)
  const { currentWordIndex } = useInPlaceWordHighlighter(
    contentRef,
    wordTimings ?? [],
    currentTime,
    isPlaying || isPaused, // keep highlight while paused
    normalizedLanguage
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

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement && 
        (activeElement.tagName === 'INPUT' || 
         activeElement.tagName === 'TEXTAREA' || 
         activeElement.tagName === 'SELECT' ||
         activeElement.contentEditable === 'true')
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying && !isPaused) {
            handlePause();
          } else if (isPaused) {
            handleResume();
          } else {
            handlePlay();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          elevenLabsSeek(currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          elevenLabsSeek(currentTime - 5);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, currentTime, elevenLabsSeek]);

  // Click-to-seek handler
  const handleContentClick = React.useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wordAttr = target.getAttribute('data-word');
    
    if (wordAttr !== null && wordTimings) {
      const wordIndex = parseInt(wordAttr, 10);
      if (!isNaN(wordIndex) && wordTimings[wordIndex]) {
        elevenLabsSeek(wordTimings[wordIndex].start);
      }
    }
  }, [wordTimings, elevenLabsSeek]);

  const handlePlay = async () => {
    await elevenLabsSpeak(cleanText);
  };

  const handlePause = () => elevenLabsPause();
  const handleResume = () => elevenLabsResume();
  const handleStop = () => elevenLabsStop();

  const speechState = {
    isPlaying,
    isPaused,
    isLoading: elevenLabsLoading,
    currentTime,
    duration,
    error
  };

  return (
    <ErrorBoundary>
      <div className={`space-y-4 ${className || ''}`}>
        <TTSDebugHUD 
          speechState={speechState}
          wordTimings={wordTimings}
          currentWordIndex={currentWordIndex}
          language={normalizedLanguage}
        />
        
        {/* Controls */}
        <div className="flex justify-end">
          <SpeechControls
            isPlaying={isPlaying}
            isPaused={isPaused}
            isLoading={elevenLabsLoading}
            error={error}
            currentTime={currentTime}
            duration={duration}
            onPlay={handlePlay}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onSeek={elevenLabsSeek}
          />
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="prose max-w-none max-h-96 overflow-y-auto cursor-pointer"
          aria-live="polite"
          aria-atomic="true"
          lang={normalizedLanguage}
          dir="auto"
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default InlineReadAloud;
