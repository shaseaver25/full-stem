import { useEffect } from 'react';
import { useFocusMode } from '@/contexts/FocusModeContext';

/**
 * Custom hook to handle Ctrl + Alt + F keyboard shortcut for toggling Focus Mode
 */
export function useFocusModeShortcut() {
  const { focusMode, setFocusMode } = useFocusMode();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl + Alt + F
      if (event.ctrlKey && event.altKey && event.key === 'f') {
        event.preventDefault();
        setFocusMode(!focusMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusMode, setFocusMode]);
}
