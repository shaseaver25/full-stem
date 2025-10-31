import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Languages } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useTranslation } from '@/hooks/useTranslation';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface InlineReadAloudProps {
  text: string;       // HTML string
  className?: string;
  language?: string;  // Language for TTS
}

const InlineReadAloud: React.FC<InlineReadAloudProps> = ({ text, className, language }) => {
  const { speak, isPlaying, isLoading, isEnabled: ttsEnabled } = useTextToSpeech();
  const { translate, isTranslating, isEnabled: translationEnabled } = useTranslation();
  const { settings } = useAccessibility();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);

  // Strip HTML tags for TTS
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleReadAloud = async () => {
    const plainText = stripHtml(text);
    await speak(plainText);
  };

  const handleTranslate = async () => {
    if (!showTranslation) {
      const plainText = stripHtml(text);
      const translated = await translate(plainText);
      setTranslatedText(translated);
      setShowTranslation(true);
    } else {
      setShowTranslation(false);
    }
  };

  const sanitizedHTML = DOMPurify.sanitize(text, { USE_PROFILES: { html: true } });
  const displayText = showTranslation && translatedText ? translatedText : sanitizedHTML;

  return (
    <div className="space-y-4">
      {(ttsEnabled || translationEnabled) && (
        <div className="flex gap-2">
          {ttsEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReadAloud}
              disabled={isLoading || isPlaying}
              className="flex items-center gap-2"
            >
              {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isLoading ? 'Loading...' : isPlaying ? 'Playing...' : 'Read Aloud'}
            </Button>
          )}
          {translationEnabled && settings.preferredLanguage !== 'en' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              {isTranslating ? 'Translating...' : showTranslation ? 'Show Original' : 'Translate'}
            </Button>
          )}
        </div>
      )}
      <div 
        className={`prose max-w-none ${className || ''}`}
        dangerouslySetInnerHTML={{ __html: showTranslation ? DOMPurify.sanitize(translatedText) : displayText }}
      />
    </div>
  );
}

export default InlineReadAloud;
