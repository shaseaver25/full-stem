import { useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Volume2, Globe, Contrast, Type, Accessibility, ChevronUp, ChevronDown } from 'lucide-react';

export function AccessibilityToolbar() {
  const { settings, updateSettings, isLoading } = useAccessibility();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSetting = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  if (isLoading) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop Toolbar - Hidden on mobile */}
      <div
        className="hidden md:flex fixed bottom-5 right-5 bg-card shadow-lg border rounded-full items-center gap-2 px-3 py-2 z-50 transition-all duration-200 hover:shadow-xl"
        role="toolbar"
        aria-label="Accessibility Toolbar"
      >
        {/* Text-to-Speech */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={settings.ttsEnabled ? 'default' : 'outline'}
              size="icon"
              className="rounded-full h-10 w-10"
              aria-label="Toggle Text-to-Speech"
              aria-pressed={settings.ttsEnabled}
              onClick={() => toggleSetting('ttsEnabled', !settings.ttsEnabled)}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Text-to-Speech {settings.ttsEnabled ? 'Enabled' : 'Disabled'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Translation */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={settings.translationEnabled ? 'default' : 'outline'}
              size="icon"
              className="rounded-full h-10 w-10"
              aria-label="Toggle Translation"
              aria-pressed={settings.translationEnabled}
              onClick={() => toggleSetting('translationEnabled', !settings.translationEnabled)}
            >
              <Globe className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Translation {settings.translationEnabled ? 'Enabled' : 'Disabled'}</p>
          </TooltipContent>
        </Tooltip>

        {/* High Contrast */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={settings.highContrast ? 'default' : 'outline'}
              size="icon"
              className="rounded-full h-10 w-10"
              aria-label="Toggle High Contrast Mode"
              aria-pressed={settings.highContrast}
              onClick={() => toggleSetting('highContrast', !settings.highContrast)}
            >
              <Contrast className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>High Contrast {settings.highContrast ? 'Enabled' : 'Disabled'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Dyslexia Font */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={settings.dyslexiaFont ? 'default' : 'outline'}
              size="icon"
              className="rounded-full h-10 w-10"
              aria-label="Toggle Dyslexia-Friendly Font"
              aria-pressed={settings.dyslexiaFont}
              onClick={() => toggleSetting('dyslexiaFont', !settings.dyslexiaFont)}
            >
              <Type className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Dyslexia Font {settings.dyslexiaFont ? 'Enabled' : 'Disabled'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile Toolbar - Shown on mobile as collapsible menu */}
      <div className="md:hidden fixed bottom-5 right-5 z-50">
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all"
              aria-label="Open Accessibility Menu"
            >
              <Accessibility className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="w-72 p-4"
            role="menu"
            aria-label="Accessibility Options"
          >
            <div className="space-y-3">
              <h3 className="font-semibold text-sm mb-3">Accessibility Options</h3>

              {/* Text-to-Speech Toggle */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  settings.ttsEnabled
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => toggleSetting('ttsEnabled', !settings.ttsEnabled)}
                role="menuitemcheckbox"
                aria-checked={settings.ttsEnabled}
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5" />
                  <span className="font-medium">Text-to-Speech</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.ttsEnabled ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      settings.ttsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>

              {/* Translation Toggle */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  settings.translationEnabled
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => toggleSetting('translationEnabled', !settings.translationEnabled)}
                role="menuitemcheckbox"
                aria-checked={settings.translationEnabled}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">Translation</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.translationEnabled ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      settings.translationEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>

              {/* High Contrast Toggle */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  settings.highContrast
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => toggleSetting('highContrast', !settings.highContrast)}
                role="menuitemcheckbox"
                aria-checked={settings.highContrast}
              >
                <div className="flex items-center gap-3">
                  <Contrast className="h-5 w-5" />
                  <span className="font-medium">High Contrast</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.highContrast ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      settings.highContrast ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>

              {/* Dyslexia Font Toggle */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  settings.dyslexiaFont
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => toggleSetting('dyslexiaFont', !settings.dyslexiaFont)}
                role="menuitemcheckbox"
                aria-checked={settings.dyslexiaFont}
              >
                <div className="flex items-center gap-3">
                  <Type className="h-5 w-5" />
                  <span className="font-medium">Dyslexia Font</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.dyslexiaFont ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      settings.dyslexiaFont ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
