import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getFocusableElements, 
  trapFocus, 
  handleEscapeKey,
  generateAriaId,
  announceToScreenReader,
  isElementFocusable,
  createShortcutHandler
} from '@/utils/accessibility';

describe('Accessibility Utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('getFocusableElements', () => {
    it('should find all focusable elements', () => {
      document.body.innerHTML = `
        <div id="container">
          <button>Button 1</button>
          <a href="#">Link</a>
          <input type="text" />
          <button disabled>Disabled</button>
          <div tabindex="0">Focusable Div</div>
        </div>
      `;

      const container = document.getElementById('container')!;
      const focusable = getFocusableElements(container);

      expect(focusable).toHaveLength(4); // button, link, input, div (not disabled button)
    });
  });

  describe('generateAriaId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateAriaId('test');
      const id2 = generateAriaId('test');

      expect(id1).not.toBe(id2);
      expect(id1).toContain('test-');
    });
  });

  describe('handleEscapeKey', () => {
    it('should call callback on Escape key', () => {
      const callback = vi.fn();
      const handler = handleEscapeKey(callback);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      handler(event);

      expect(callback).toHaveBeenCalledOnce();
    });

    it('should not call callback on other keys', () => {
      const callback = vi.fn();
      const handler = handleEscapeKey(callback);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      handler(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('isElementFocusable', () => {
    it('should return true for focusable elements', () => {
      document.body.innerHTML = '<button>Click me</button>';
      const button = document.querySelector('button')!;

      expect(isElementFocusable(button)).toBe(true);
    });

    it('should return false for disabled elements', () => {
      document.body.innerHTML = '<button disabled>Click me</button>';
      const button = document.querySelector('button')!;

      expect(isElementFocusable(button)).toBe(false);
    });
  });

  describe('announceToScreenReader', () => {
    it('should create and remove live region', () => {
      announceToScreenReader('Test message', 'polite');

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.textContent).toBe('Test message');
    });
  });

  describe('createShortcutHandler', () => {
    it('should handle keyboard shortcuts', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const shortcuts = {
        'ctrl+s': handler1,
        'alt+k': handler2,
      };

      const shortcutHandler = createShortcutHandler(shortcuts);

      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true 
      });

      shortcutHandler(event);
      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).not.toHaveBeenCalled();
    });
  });
});
