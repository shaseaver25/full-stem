import { useFocusMode } from '@/contexts/FocusModeContext';
import { Button } from '@/components/ui/button';
import { EyeOff, Eye } from 'lucide-react';

export function FocusModeToggle() {
  const { focusMode, setFocusMode, isLoading } = useFocusMode();

  if (isLoading) {
    return null;
  }

  return (
    <Button
      variant={focusMode ? 'default' : 'outline'}
      size="sm"
      onClick={() => setFocusMode(!focusMode)}
      aria-label={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
      aria-pressed={focusMode}
      className="flex items-center gap-2"
    >
      {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      <span className="hidden sm:inline">
        {focusMode ? 'Exit Focus' : 'Focus Mode'}
      </span>
    </Button>
  );
}
