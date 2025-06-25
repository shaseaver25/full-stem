
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Loader2, Languages, X } from 'lucide-react';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import ReadAloudButton from '@/components/ReadAloudButton';

interface LiveTranslationBoxProps {
  originalContent: string;
  lessonTitle: string;
  onTranslationComplete?: (translatedContent: string, language: string) => void;
}

const LiveTranslationBox: React.FC<LiveTranslationBoxProps> = ({
  originalContent,
  lessonTitle,
  onTranslationComplete
}) => {
  const [targetLanguage, setTargetLanguage] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [currentTargetLanguage, setCurrentTargetLanguage] = useState<string>('');
  const { translateText, isTranslating } = useLiveTranslation();

  const commonLanguages = [
    { code: 'spanish', name: 'Spanish' },
    { code: 'french', name: 'French' },
    { code: 'german', name: 'German' },
    { code: 'italian', name: 'Italian' },
    { code: 'portuguese', name: 'Portuguese' },
    { code: 'russian', name: 'Russian' },
    { code: 'chinese', name: 'Chinese' },
    { code: 'japanese', name: 'Japanese' },
    { code: 'korean', name: 'Korean' },
    { code: 'arabic', name: 'Arabic' },
    { code: 'hindi', name: 'Hindi' },
    { code: 'somali', name: 'Somali' },
    { code: 'swahili', name: 'Swahili' },
    { code: 'custom', name: 'Other Language' }
  ];

  const handleTranslate = async () => {
    const language = targetLanguage === 'custom' ? customLanguage : targetLanguage;
    
    if (!language) {
      return;
    }

    const result = await translateText({
      text: originalContent,
      targetLanguage: language
    });

    if (result) {
      setTranslatedContent(result);
      setCurrentTargetLanguage(language);
      onTranslationComplete?.(result, language);
    }
  };

  const handleClearTranslation = () => {
    setTranslatedContent(null);
    setCurrentTargetLanguage('');
    setTargetLanguage('');
    setCustomLanguage('');
  };

  const fullTranslatedText = translatedContent ? `${lessonTitle}. ${translatedContent}` : '';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Live Translation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!translatedContent ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {targetLanguage === 'custom' && (
                <div className="flex-1">
                  <Input
                    placeholder="Enter language name"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                  />
                </div>
              )}
            </div>

            <Button 
              onClick={handleTranslate}
              disabled={isTranslating || !targetLanguage || (targetLanguage === 'custom' && !customLanguage)}
              className="w-full"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Translate Content
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Translated to {currentTargetLanguage}
              </Badge>
              <div className="flex items-center gap-2">
                <ReadAloudButton 
                  text={fullTranslatedText}
                  className="flex-shrink-0"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearTranslation}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                {translatedContent}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveTranslationBox;
