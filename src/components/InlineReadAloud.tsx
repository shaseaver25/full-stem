import React from 'react';
import SpeechControls from './SpeechControls';
import WordHighlighter from './WordHighlighter';
import { useHighlightedSpeech } from '@/hooks/useHighlightedSpeech';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

interface InlineReadAloudProps {
  text: string;
  className?: string;
}

const InlineReadAloud: React.FC<InlineReadAloudProps> = ({ text, className }) => {
  // Extract clean text from HTML content first
  const cleanText = React.useMemo(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || '';
  }, [text]);

  // Use ElevenLabs for high-quality voice
  const {
    speak: elevenLabsSpeak,
    pause: elevenLabsPause,
    resume: elevenLabsResume,
    stop: elevenLabsStop,
    isPlaying: elevenLabsPlaying,
    isPaused: elevenLabsPaused,
    isLoading: elevenLabsLoading,
  } = useElevenLabsTTS();

  // Use browser TTS for word highlighting sync
  const {
    isPlaying: highlightPlaying,
    isPaused: highlightPaused,
    currentWordIndex,
    textParts,
    wordPositions,
    speak: highlightSpeak,
    pause: highlightPause,
    resume: highlightResume,
    stop: highlightStop,
  } = useHighlightedSpeech(cleanText);

  // Combine both systems
  const isPlaying = elevenLabsPlaying || highlightPlaying;
  const isPaused = elevenLabsPaused || highlightPaused;

  const handlePlay = async () => {
    // Start ElevenLabs for natural voice audio
    await elevenLabsSpeak(cleanText);
    // Start browser TTS silently for word highlighting only
    highlightSpeak();
  };

  const handlePause = () => {
    elevenLabsPause();
    highlightPause();
  };

  const handleResume = () => {
    elevenLabsResume();
    highlightResume();
  };

  const handleStop = () => {
    elevenLabsStop();
    highlightStop();
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Speech Controls */}
      <div className="flex justify-end">
        <SpeechControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          isLoading={elevenLabsLoading}
          onPlay={handlePlay}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
        />
      </div>
      
      {/* Content with word highlighting */}
      <div className="prose max-w-none">
        {isPlaying || isPaused ? (
          <div className="text-gray-800 leading-relaxed text-lg">
            <WordHighlighter
              textParts={textParts}
              wordPositions={wordPositions}
              currentWordIndex={currentWordIndex}
            />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: text }} />
        )}
      </div>
    </div>
  );
};

export default InlineReadAloud;