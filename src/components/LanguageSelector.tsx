import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAccessibility } from '@/contexts/AccessibilityContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
];

export function LanguageSelector() {
  const { settings, updateSettings } = useAccessibility();

  const handleLanguageChange = (newLanguage: string) => {
    updateSettings({ preferredLanguage: newLanguage });
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={settings.preferredLanguage || 'en'} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent className="z-50 bg-background">
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
