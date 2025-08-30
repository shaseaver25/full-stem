import { useEffect, useRef, useMemo } from 'react';
import { segmentWords } from '@/utils/segment';
import { WordTiming } from '@/types/tts';

export const useInPlaceWordHighlighter = (
  containerRef: React.RefObject<HTMLElement>,
  timings: WordTiming[],
  currentTime: number,
  isActive: boolean,
  language?: string
) => {
  const wrappedSpansRef = useRef<HTMLElement[]>([]);
  const lastHighlightedIndexRef = useRef<number>(-1);
  const isInitializedRef = useRef<boolean>(false);
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  // Initialize word wrapping when playback becomes active
  useEffect(() => {
    if (!isBrowser || !containerRef.current || !isActive || isInitializedRef.current) {
      return;
    }

    const container = containerRef.current;
    const spans: HTMLElement[] = [];

    // Walk through all text nodes and wrap non-whitespace tokens
    const wrapTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const text = textNode.nodeValue ?? '';
        
        if (!text.trim()) return;

        const fragment = document.createDocumentFragment();
        // Use international word segmentation
        const words = segmentWords(text, language);
        let wordIndex = 0;

        // Split by words but preserve whitespace structure
        const parts = text.split(/(\s+)/);
        
        for (const part of parts) {
          if (!part) continue;
          
          if (/^\s+$/.test(part)) {
            // Preserve whitespace as-is
            fragment.appendChild(document.createTextNode(part));
          } else {
            // Check if this part contains word content
            const partWords = segmentWords(part, language);
            if (partWords.length > 0) {
              // Wrap the whole part in a span
              const span = document.createElement('span');
              span.textContent = part;
              span.setAttribute('data-word', spans.length.toString());
              span.className = 'readable-word';
              span.style.transition = 'background-color 0.12s ease';
              fragment.appendChild(span);
              spans.push(span);
            } else {
              // No word content, keep as text
              fragment.appendChild(document.createTextNode(part));
            }
          }
        }

        textNode.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Recursively process child nodes
        const children = Array.from(node.childNodes);
        children.forEach(wrapTextNodes);
      }
    };

    // Start the wrapping process
    wrapTextNodes(container);
    
    // Store the spans for later highlighting
    wrappedSpansRef.current = spans;
    isInitializedRef.current = true;
  }, [isBrowser, containerRef, isActive]);

  // Calculate current word index based on timing
  const currentWordIndex = useMemo(() => {
    if (!timings.length || !isActive) return -1;
    
    const t = Math.max(0, currentTime);
    let idx = timings.findIndex(w => t >= w.start && t < w.end);
    
    // If we're past all timings, highlight the last word
    if (idx === -1 && t >= timings[timings.length - 1]?.end) {
      idx = timings.length - 1;
    }
    
    return idx;
  }, [timings, currentTime, isActive]);

  // Update highlighting based on current word index
  useEffect(() => {
    if (!isBrowser || !isInitializedRef.current || wrappedSpansRef.current.length === 0) {
      return;
    }

    const spans = wrappedSpansRef.current;
    const prevIndex = lastHighlightedIndexRef.current;
    const newIndex = currentWordIndex;

    // Remove highlight from previous word
    if (prevIndex >= 0 && prevIndex < spans.length) {
      const prevSpan = spans[prevIndex];
      prevSpan.removeAttribute('data-word-highlight');
      prevSpan.removeAttribute('aria-current');
      prevSpan.style.backgroundColor = '';
      prevSpan.style.borderRadius = '';
      prevSpan.style.padding = '';
    }

    // Add highlight to current word
    if (newIndex >= 0 && newIndex < spans.length) {
      const currentSpan = spans[newIndex];
      currentSpan.setAttribute('data-word-highlight', 'true');
      currentSpan.setAttribute('aria-current', 'true');
      currentSpan.style.backgroundColor = 'rgba(59,130,246,0.35)';
      currentSpan.style.borderRadius = '3px';
      currentSpan.style.padding = '0 2px';
    }

    lastHighlightedIndexRef.current = newIndex;
  }, [isBrowser, currentWordIndex]);

  // Clean up when not active
  useEffect(() => {
    if (!isBrowser || !isActive) {
      lastHighlightedIndexRef.current = -1;
      
      // Remove all highlights when not active
      if (isInitializedRef.current && wrappedSpansRef.current.length > 0) {
        wrappedSpansRef.current.forEach(span => {
          span.removeAttribute('data-word-highlight');
          span.removeAttribute('aria-current');
          span.style.backgroundColor = '';
          span.style.borderRadius = '';
          span.style.padding = '';
        });
      }
    }
  }, [isBrowser, isActive]);

  // Reset when component unmounts or container changes
  useEffect(() => {
    return () => {
      isInitializedRef.current = false;
      wrappedSpansRef.current = [];
      lastHighlightedIndexRef.current = -1;
    };
  }, [containerRef]);

  // Return the currently highlighted word index for external use (like auto-scroll)
  return { currentWordIndex: isActive ? currentWordIndex : -1 };
};