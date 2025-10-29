import React, { useState, useMemo, useEffect } from 'react';
import { useElevenLabsTTSPublic } from '@/hooks/useElevenLabsTTSPublic';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DemoReadAloudProps {
  text: string;
}

const VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (Female)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female)' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (Male)' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (Male)' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily (Female)' },
];

// Generate synthetic word timings as fallback
const generateSyntheticTimings = (text: string, duration: number) => {
  const words = text.trim().split(/\s+/);
  const avgDuration = duration / words.length;
  
  return words.map((word, index) => ({
    word: word,
    start: index * avgDuration,
    end: (index + 1) * avgDuration
  }));
};

export const DemoReadAloud: React.FC<DemoReadAloudProps> = ({ text }) => {
  const [selectedVoiceEn, setSelectedVoiceEn] = useState(VOICES[0].id);
  const [selectedVoiceTranslated, setSelectedVoiceTranslated] = useState(VOICES[1].id);
  const [playbackSpeedEn, setPlaybackSpeedEn] = useState(1.0);
  const [playbackSpeedTranslated, setPlaybackSpeedTranslated] = useState(1.0);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  
  const { settings } = useAccessibility();
  const { translateText, isTranslating } = useLiveTranslation();
  
  // Separate TTS instances for English and translated text
  const englishTTS = useElevenLabsTTSPublic();
  const translatedTTS = useElevenLabsTTSPublic();

  // Translate text when language changes
  useEffect(() => {
    const performTranslation = async () => {
      if (settings.preferredLanguage !== 'en') {
        const result = await translateText({
          text,
          targetLanguage: settings.preferredLanguage,
          sourceLanguage: 'en'
        });
        setTranslatedText(result);
      } else {
        setTranslatedText(null);
      }
    };

    performTranslation();
  }, [settings.preferredLanguage, text]);

  // Split text into words for both languages
  const englishWords = useMemo(() => {
    return text.split(/\s+/).filter(w => w.length > 0);
  }, [text]);

  const translatedWords = useMemo(() => {
    return (translatedText || '').split(/\s+/).filter(w => w.length > 0);
  }, [translatedText]);

  // Effective timings for English
  const effectiveTimingsEn = useMemo(() => {
    if (englishTTS.wordTimings && englishTTS.wordTimings.length === englishWords.length) {
      return englishTTS.wordTimings;
    }
    if (englishTTS.duration > 0 && englishWords.length > 0) {
      return generateSyntheticTimings(englishWords.join(' '), englishTTS.duration);
    }
    return [];
  }, [englishTTS.wordTimings, englishWords, englishTTS.duration]);

  // Effective timings for translated text
  const effectiveTimingsTranslated = useMemo(() => {
    if (translatedTTS.wordTimings && translatedTTS.wordTimings.length === translatedWords.length) {
      return translatedTTS.wordTimings;
    }
    if (translatedTTS.duration > 0 && translatedWords.length > 0) {
      return generateSyntheticTimings(translatedWords.join(' '), translatedTTS.duration);
    }
    return [];
  }, [translatedTTS.wordTimings, translatedWords, translatedTTS.duration]);

  // Current word index for English
  const currentWordIndexEn = useMemo(() => {
    if (!effectiveTimingsEn || effectiveTimingsEn.length === 0 || !englishTTS.isPlaying) {
      return -1;
    }
    for (let i = 0; i < effectiveTimingsEn.length; i++) {
      const timing = effectiveTimingsEn[i];
      if (englishTTS.currentTime >= timing.start && englishTTS.currentTime < timing.end) {
        return i;
      }
    }
    return -1;
  }, [englishTTS.currentTime, effectiveTimingsEn, englishTTS.isPlaying]);

  // Current word index for translated
  const currentWordIndexTranslated = useMemo(() => {
    if (!effectiveTimingsTranslated || effectiveTimingsTranslated.length === 0 || !translatedTTS.isPlaying) {
      return -1;
    }
    for (let i = 0; i < effectiveTimingsTranslated.length; i++) {
      const timing = effectiveTimingsTranslated[i];
      if (translatedTTS.currentTime >= timing.start && translatedTTS.currentTime < timing.end) {
        return i;
      }
    }
    return -1;
  }, [translatedTTS.currentTime, effectiveTimingsTranslated, translatedTTS.isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTextBox = (
    title: string,
    words: string[],
    currentWordIndex: number,
    tts: ReturnType<typeof useElevenLabsTTSPublic>,
    selectedVoice: string,
    setSelectedVoice: (v: string) => void,
    playbackSpeed: number,
    setPlaybackSpeed: (s: number) => void,
    textToSpeak: string
  ) => {
    const handlePlayPause = async () => {
      if (tts.isPlaying) {
        tts.pause();
      } else if (tts.isPaused) {
        tts.resume();
      } else {
        await tts.speak(textToSpeak, selectedVoice, playbackSpeed);
      }
    };

    return (
      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        
        {/* Text Display with Highlighting */}
        <div className="bg-card border border-border rounded-lg p-6 min-h-[200px]">
          <p className="text-lg leading-relaxed">
            {words.map((word, index) => {
              const isHighlighted = currentWordIndex === index;
              return (
                <span
                  key={index}
                  className={`transition-all duration-200 ${
                    isHighlighted
                      ? 'bg-yellow-400/30 text-foreground font-semibold px-1 rounded'
                      : 'text-foreground'
                  }`}
                >
                  {word}{' '}
                </span>
              );
            })}
          </p>
        </div>

        {/* Error Display */}
        {tts.error && (
          <Alert variant="destructive">
            <AlertDescription>{tts.error}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          {/* Main Play/Pause Button */}
          <div className="flex justify-center">
            <Button
              onClick={handlePlayPause}
              disabled={tts.isLoading}
              size="lg"
              className="h-16 w-40 text-lg font-semibold"
            >
              {tts.isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  Loading...
                </>
              ) : tts.isPlaying ? (
                <>
                  <Pause className="h-6 w-6 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 mr-2" />
                  {tts.isPaused ? 'Resume' : 'Play'}
                </>
              )}
            </Button>
          </div>

          {/* Stop Button */}
          {(tts.isPlaying || tts.isPaused) && (
            <div className="flex justify-center">
              <Button
                onClick={tts.stop}
                variant="outline"
                size="sm"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          {tts.duration > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(tts.currentTime)}</span>
                <span>{formatTime(tts.duration)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-200"
                  style={{ width: `${(tts.currentTime / tts.duration) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice
            </label>
            <Select
              value={selectedVoice}
              onValueChange={setSelectedVoice}
              disabled={tts.isPlaying || tts.isLoading}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Speed: {playbackSpeed.toFixed(1)}x
            </label>
            <Slider
              value={[playbackSpeed]}
              onValueChange={(value) => setPlaybackSpeed(value[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              disabled={tts.isPlaying || tts.isLoading}
            />
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-sm">
            {tts.isLoading && (
              <>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">Loading...</span>
              </>
            )}
            {tts.isPlaying && !tts.isLoading && (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">Playing</span>
              </>
            )}
            {tts.isPaused && (
              <>
                <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                <span className="text-muted-foreground">Paused</span>
              </>
            )}
            {!tts.isPlaying && !tts.isPaused && !tts.isLoading && (
              <>
                <div className="h-2 w-2 bg-muted-foreground/50 rounded-full" />
                <span className="text-muted-foreground">Ready</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      {/* Translation Status */}
      {isTranslating && (
        <div className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
          <Loader2 className="h-3 w-3 animate-spin" />
          Translating to {settings.preferredLanguage}...
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* English Text Box */}
        {renderTextBox(
          'English',
          englishWords,
          currentWordIndexEn,
          englishTTS,
          selectedVoiceEn,
          setSelectedVoiceEn,
          playbackSpeedEn,
          setPlaybackSpeedEn,
          text
        )}

        {/* Translated Text Box */}
        {settings.preferredLanguage !== 'en' && translatedText && renderTextBox(
          `${settings.preferredLanguage.toUpperCase()}`,
          translatedWords,
          currentWordIndexTranslated,
          translatedTTS,
          selectedVoiceTranslated,
          setSelectedVoiceTranslated,
          playbackSpeedTranslated,
          setPlaybackSpeedTranslated,
          translatedText
        )}
      </div>
    </div>
  );
};

export default DemoReadAloud;
