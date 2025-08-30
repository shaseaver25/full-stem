/**
 * Shared types for text-to-speech functionality
 */

export type WordTiming = {
  start: number;
  end: number;
  index: number;
  text: string;
};

export type SpeechState = {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
};

export type TTSOptions = {
  voiceId?: string;
  rate?: number;
  language?: string;
};