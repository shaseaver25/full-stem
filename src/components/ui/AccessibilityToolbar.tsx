import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useFocusMode } from '@/contexts/FocusModeContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Volume2, Globe, Contrast, Type, Accessibility, Eye, EyeOff, Moon, Sun } from 'lucide-react';

export function AccessibilityToolbar() {
  const { settings, updateSettings, isLoading } = useAccessibility();
  const { focusMode, setFocusMode } = useFocusMode();
  const { theme, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync theme with accessibility settings
  useEffect(() => {
    if (settings.darkMode && theme !== 'dark') {
      setTheme('dark');
    } else if (!settings.darkMode && theme === 'dark') {
      setTheme('light');
    }
  }, [settings.darkMode, theme, setTheme]);

  const toggleSetting = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const toggleTheme = () => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    setTheme(newDarkMode ? 'dark' : 'light');
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* Desktop Toolbar - Floating icon button on middle-right */}
      <div className="hidden md:block fixed right-6 top-1/2 -translate-y-1/2 z-50">
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground"
              aria-label="Open Accessibility Menu"
            >
              <Accessibility className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="center"
            className="w-72 p-4 bg-card z-50"
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

              {/* Focus Mode Toggle */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  focusMode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setFocusMode(!focusMode)}
                role="menuitemcheckbox"
                aria-checked={focusMode}
              >
                <div className="flex items-center gap-3">
                  {focusMode ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                  <span className="font-medium">Focus Mode</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    focusMode ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      focusMode ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>

              {/* Dark Mode Toggle */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  settings.darkMode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={toggleTheme}
                role="menuitemcheckbox"
                aria-checked={settings.darkMode}
              >
                <div className="flex items-center gap-3">
                  {settings.darkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <span className="font-medium">Dark Mode</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.darkMode ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      settings.darkMode ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Toolbar - Bottom-right as before */}
      <div className="md:hidden fixed bottom-5 right-5 z-50">
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground"
              aria-label="Open Accessibility Menu"
            >
              <Accessibility className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="w-72 p-4 bg-card z-50"
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

              {/* Focus Mode Toggle */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  focusMode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setFocusMode(!focusMode)}
                role="menuitemcheckbox"
                aria-checked={focusMode}
              >
                <div className="flex items-center gap-3">
                  {focusMode ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                  <span className="font-medium">Focus Mode</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    focusMode ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      focusMode ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>

              {/* Dark Mode Toggle */}
              <button
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  settings.darkMode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={toggleTheme}
                role="menuitemcheckbox"
                aria-checked={settings.darkMode}
              >
                <div className="flex items-center gap-3">
                  {settings.darkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <span className="font-medium">Dark Mode</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.darkMode ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      settings.darkMode ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
