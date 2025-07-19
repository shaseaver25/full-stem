
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Globe, 
  Loader2, 
  Volume2, 
  Eye, 
  EyeOff,
  Settings,
  Languages,
  Sparkles
} from 'lucide-react';
import { useRealTimeTranslation } from './RealTimeTranslationProvider';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface SmartTranslationWidgetProps {
  content: string;
  contentId?: string;
  showControls?: boolean;
  autoTranslate?: boolean;
  className?: string;
}

const SmartTranslationWidget: React.FC<SmartTranslationWidgetProps> = ({
  content,
  contentId,
  showControls = true,
  autoTranslate = false,
  className = ''
}) => {
  const { preferences, savePreferences } = useUserPreferences();
  const { 
    isTranslating, 
    currentLanguage, 
    translateContent, 
    clearTranslations 
  } = useRealTimeTranslation();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);

  const commonLanguages = [
    { code: 'spanish', name: 'Spanish', native: 'Español' },
    { code: 'french', name: 'French', native: 'Français' },
    { code: 'german', name: 'German', native: 'Deutsch' },
    { code: 'italian', name: 'Italian', native: 'Italiano' },
    { code: 'portuguese', name: 'Portuguese', native: 'Português' },
    { code: 'russian', name: 'Russian', native: 'Русский' },
    { code: 'chinese', name: 'Chinese', native: '中文' },
    { code: 'japanese', name: 'Japanese', native: '日本語' },
    { code: 'korean', name: 'Korean', native: '한국어' },
    { code: 'arabic', name: 'Arabic', native: 'العربية' },
    { code: 'hindi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'somali', name: 'Somali', native: 'Soomaali' },
    { code: 'swahili', name: 'Swahili', native: 'Kiswahili' },
    { code: 'vietnamese', name: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'thai', name: 'Thai', native: 'ไทย' },
    { code: 'urdu', name: 'Urdu', native: 'اردو' }
  ];

  useEffect(() => {
    // Load user preferences
    if (preferences?.['Preferred Language']) {
      setSelectedLanguage(preferences['Preferred Language']);
    }
    if (preferences?.['Enable Translation View']) {
      setAutoTranslateEnabled(true);
    }
  }, [preferences]);

  useEffect(() => {
    // Auto-translate if enabled and language is selected
    if (autoTranslateEnabled && selectedLanguage && content && !translatedText) {
      handleTranslate();
    }
  }, [autoTranslateEnabled, selectedLanguage, content]);

  const handleTranslate = async () => {
    if (!selectedLanguage || !content) return;

    const result = await translateContent(content, selectedLanguage, contentId);
    if (result) {
      setTranslatedText(result);
      setShowTranslation(true);
      
      // Save language preference
      if (preferences) {
        await savePreferences({
          ...preferences,
          'Preferred Language': selectedLanguage,
          'Enable Translation View': true
        });
      }
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setTranslatedText('');
    setShowTranslation(false);
  };

  const toggleAutoTranslate = async (enabled: boolean) => {
    setAutoTranslateEnabled(enabled);
    
    if (preferences) {
      await savePreferences({
        ...preferences,
        'Enable Translation View': enabled
      });
    }

    if (enabled && selectedLanguage) {
      handleTranslate();
    } else if (!enabled) {
      setShowTranslation(false);
    }
  };

  const selectedLangData = commonLanguages.find(lang => lang.code === selectedLanguage);

  return (
    <div className={`space-y-4 ${className}`}>
      {showControls && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-5 w-5" />
              Smart Translation
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selection */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {commonLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{lang.name}</span>
                          <span className="text-gray-500 text-sm">({lang.native})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleTranslate}
                  disabled={!selectedLanguage || isTranslating}
                  className="flex items-center gap-2"
                >
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  Translate
                </Button>
              </div>
            </div>

            {/* Auto-translate Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Auto-translate new content</span>
              </div>
              <Switch
                checked={autoTranslateEnabled}
                onCheckedChange={toggleAutoTranslate}
              />
            </div>

            {/* Translation Status */}
            {selectedLangData && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="outline">
                  Target: {selectedLangData.native}
                </Badge>
                {translatedText && (
                  <Badge variant="default">
                    Translation ready
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Translation Display */}
      {translatedText && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                {selectedLangData?.name} Translation
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTranslation(!showTranslation)}
                >
                  {showTranslation ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          {showTranslation && (
            <CardContent>
              <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800 m-0">
                  {translatedText}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Side-by-side comparison when both are available */}
      {translatedText && showTranslation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Original (English)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800 m-0">
                  {content}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {selectedLangData?.native}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800 m-0">
                  {translatedText}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartTranslationWidget;
