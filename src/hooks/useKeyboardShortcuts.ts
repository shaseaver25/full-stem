import { useEffect } from 'react';

/**
 * Hook for registering keyboard shortcuts
 * 
 * @example
 * useKeyboardShortcuts({
 *   'ctrl+s': () => handleSave(),
 *   'escape': () => handleClose(),
 * });
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Build the shortcut string
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('ctrl');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey) parts.push('shift');
      if (e.metaKey) parts.push('meta');
      parts.push(key);
      
      const shortcutKey = parts.join('+');

      // Check if this shortcut is registered
      for (const [registeredKey, handler] of Object.entries(shortcuts)) {
        const normalizedKey = registeredKey.toLowerCase().replace(/\s/g, '');
        
        if (shortcutKey === normalizedKey || key === normalizedKey) {
          e.preventDefault();
          handler(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
