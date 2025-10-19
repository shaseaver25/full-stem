/**
 * Accessibility utility functions for keyboard navigation, focus management, and ARIA support
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

/**
 * Trap focus within a container (for modals, drawers, etc.)
 * Returns a cleanup function to remove listeners
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Store the element that had focus before opening
  const previouslyFocused = document.activeElement as HTMLElement;

  // Focus the first element
  firstElement?.focus();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    // Return focus to previously focused element
    previouslyFocused?.focus();
  };
}

/**
 * Handle Escape key to close modals/dialogs
 */
export function handleEscapeKey(
  callback: () => void
): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback();
    }
  };
}

/**
 * Generate unique IDs for ARIA attributes
 */
let idCounter = 0;
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Announce a message to screen readers via ARIA live region
 * This is a standalone function that creates a temporary live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
}

/**
 * Check if an element is visible and focusable
 */
export function isElementFocusable(element: HTMLElement): boolean {
  if (!element || element.offsetParent === null) return false;
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex === '-1') return false;
  
  return true;
}

/**
 * Create keyboard shortcut handler
 */
export function createShortcutHandler(
  shortcuts: Record<string, () => void>
): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const modifiers = {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
    };

    for (const [shortcut, handler] of Object.entries(shortcuts)) {
      const parts = shortcut.toLowerCase().split('+');
      const shortcutKey = parts[parts.length - 1];
      const requiredModifiers = parts.slice(0, -1);

      if (key === shortcutKey) {
        const modifiersMatch = requiredModifiers.every(mod => {
          if (mod === 'ctrl') return modifiers.ctrl;
          if (mod === 'alt') return modifiers.alt;
          if (mod === 'shift') return modifiers.shift;
          if (mod === 'meta' || mod === 'cmd') return modifiers.meta;
          return false;
        });

        if (modifiersMatch) {
          e.preventDefault();
          handler();
          return;
        }
      }
    }
  };
}
