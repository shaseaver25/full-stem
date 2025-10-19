import React from 'react';
import { WordTiming, SpeechState } from '@/types/tts';
import { isDev } from '@/utils/env';

interface TTSDebugHUDProps {
  speechState: SpeechState;
  wordTimings?: WordTiming[] | null;
  currentWordIndex: number;
  language?: string;
}

const TTSDebugHUD: React.FC<TTSDebugHUDProps> = ({
  speechState,
  wordTimings,
  currentWordIndex,
  language
}) => {
  // Only show in development with debug flag
  const shouldShow = isDev && 
    new URLSearchParams(window.location.search).get('debug') === '1';

  if (!shouldShow) return null;

  const { isPlaying, isPaused, isLoading, currentTime, duration, error } = speechState;
  const currentWord = wordTimings?.[currentWordIndex];

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">🎧 TTS Debug</div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>State:</span>
          <span className={`font-semibold ${
            isLoading ? 'text-yellow-400' :
            isPlaying ? 'text-green-400' :
            isPaused ? 'text-orange-400' : 'text-gray-400'
          }`}>
            {isLoading ? 'Loading' : isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Stopped'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
        </div>
        
        <div className="flex justify-between">
          <span>Progress:</span>
          <span>{duration > 0 ? Math.round((currentTime / duration) * 100) : 0}%</span>
        </div>
        
        <div className="flex justify-between">
          <span>Language:</span>
          <span>{language || 'en'}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Word Index:</span>
          <span>{currentWordIndex} / {wordTimings?.length || 0}</span>
        </div>
        
        {currentWord && (
          <div className="border-t border-white/20 pt-2 mt-2">
            <div className="font-semibold text-blue-300">Current Word:</div>
            <div className="pl-2">
              <div>Text: "{currentWord.text}"</div>
              <div>Time: {currentWord.start.toFixed(1)}s - {currentWord.end.toFixed(1)}s</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="border-t border-red-500/20 pt-2 mt-2">
            <div className="font-semibold text-red-400">Error:</div>
            <div className="text-red-300 text-xs">{error}</div>
          </div>
        )}
        
        {wordTimings && (
          <div className="border-t border-white/20 pt-2 mt-2">
            <div className="font-semibold">Timings: {wordTimings.length} words</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TTSDebugHUD;