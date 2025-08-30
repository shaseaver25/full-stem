import React from 'react';
import SpeechControls from './SpeechControls';
import { useAudioSyncedHighlighting } from '@/hooks/useAudioSyncedHighlighting';
import { useHTMLWordHighlighting } from '@/hooks/useHTMLWordHighlighting';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

interface InlineReadAloudProps {
  text: string;
  className?: string;
  language?: string; // Language for TTS
}

const InlineReadAloud: React.FC<InlineReadAloudProps> = ({ text, className, language }) => {
  // Extract clean text from HTML content first
  const cleanText = React.useMemo(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || '';
  }, [text]);

  // Use ElevenLabs for high-quality voice with language support
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
  } = useElevenLabsTTS(language);

  // Use only ElevenLabs state for controls
  const isPlaying = elevenLabsPlaying;
  const isPaused = elevenLabsPaused;

  // Use audio-synced highlighting based on ElevenLabs playback time
  const {
    textParts,
    wordPositions,
    currentWordIndex,
  } = useAudioSyncedHighlighting(cleanText, currentTime, duration, isPlaying);

  // Get HTML with word highlighting applied
  const highlightedHTML = useHTMLWordHighlighting(
    text,
    cleanText,
    currentWordIndex,
    wordPositions
  );

  const handlePlay = async () => {
    // Only use ElevenLabs for both audio and highlighting sync
    await elevenLabsSpeak(cleanText);
  };

  const handlePause = () => {
    elevenLabsPause();
  };

  const handleResume = () => {
    elevenLabsResume();
  };

  const handleStop = () => {
    elevenLabsStop();
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
        <div dangerouslySetInnerHTML={{ 
          __html: (isPlaying || isPaused) ? highlightedHTML : text 
        }} />
      </div>
    </div>
  );
};

export default InlineReadAloud;