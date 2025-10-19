import { useEffect, RefObject } from 'react';
import { trapFocus } from '@/utils/accessibility';

/**
 * Hook to trap focus within a container element
 * Useful for modals, dialogs, and other overlay components
 * 
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isOpen);
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const cleanup = trapFocus(containerRef.current);
    return cleanup;
  }, [containerRef, enabled]);
}
