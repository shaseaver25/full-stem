import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Languages, Contrast, Type } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'hmn', label: 'Hmong' },
  { code: 'so', label: 'Somali' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fr', label: 'French' },
  { code: 'zh', label: 'Mandarin Chinese' },
  { code: 'ko', label: 'Korean' },
];

const VOICE_STYLES = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'neutral', label: 'Neutral' },
];

export function AccessibilityToggle() {
  const { settings, updateSettings, isLoading } = useAccessibility();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Options</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Options</CardTitle>
        <CardDescription>
          Customize your experience with accessibility features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text-to-Speech */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="tts-toggle" className="cursor-pointer">
                Text-to-Speech
              </Label>
              <p className="text-sm text-muted-foreground">
                Hear feedback and content read aloud
              </p>
            </div>
          </div>
          <Switch
            id="tts-toggle"
            checked={settings.ttsEnabled}
            onCheckedChange={(checked) => updateSettings({ ttsEnabled: checked })}
          />
        </div>

        {/* Voice Style Selection */}
        {settings.ttsEnabled && (
          <div className="ml-8 space-y-2">
            <Label htmlFor="voice-style">Voice Style</Label>
            <Select
              value={settings.voiceStyle}
              onValueChange={(value) => updateSettings({ voiceStyle: value })}
            >
              <SelectTrigger id="voice-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICE_STYLES.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Translation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Languages className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="translation-toggle" className="cursor-pointer">
                Translation
              </Label>
              <p className="text-sm text-muted-foreground">
                Translate content to your preferred language
              </p>
            </div>
          </div>
          <Switch
            id="translation-toggle"
            checked={settings.translationEnabled}
            onCheckedChange={(checked) => updateSettings({ translationEnabled: checked })}
          />
        </div>

        {/* Language Selection */}
        {settings.translationEnabled && (
          <div className="ml-8 space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select
              value={settings.preferredLanguage}
              onValueChange={(value) => updateSettings({ preferredLanguage: value })}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* High Contrast Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Contrast className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="contrast-toggle" className="cursor-pointer">
                High Contrast Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Increase visual contrast for better readability
              </p>
            </div>
          </div>
          <Switch
            id="contrast-toggle"
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
          />
        </div>

        {/* Dyslexia Font */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Type className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="font-toggle" className="cursor-pointer">
                Dyslexia-Friendly Font
              </Label>
              <p className="text-sm text-muted-foreground">
                Use OpenDyslexic font for easier reading
              </p>
            </div>
          </div>
          <Switch
            id="font-toggle"
            checked={settings.dyslexiaFont}
            onCheckedChange={(checked) => updateSettings({ dyslexiaFont: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
