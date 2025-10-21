import { useEffect } from 'react';

/**
 * ThemeEnforcer Component
 * Aggressively enforces light mode across the entire application
 */
export const ThemeEnforcer = () => {
  useEffect(() => {
    // Remove dark class immediately on mount
    const enforceLightMode = () => {
      const html = document.documentElement;
      const body = document.body;
      
      // Remove dark class if it exists
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
      }
      if (body.classList.contains('dark')) {
        body.classList.remove('dark');
      }
      
      // Force light color scheme
      html.style.colorScheme = 'light';
      body.style.backgroundColor = 'hsl(0 0% 100%)';
      
      // Clear any stored dark theme preference
      try {
        localStorage.removeItem('theme');
        localStorage.setItem('theme', 'light');
      } catch (e) {
        console.warn('Could not access localStorage:', e);
      }
    };

    // Enforce immediately
    enforceLightMode();

    // Set up MutationObserver to watch for dark class being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('dark')) {
            target.classList.remove('dark');
            console.warn('🎨 Prevented dark mode from being applied');
          }
        }
      });
    });

    // Observe both html and body for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Also check periodically as a fallback
    const interval = setInterval(enforceLightMode, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
};
