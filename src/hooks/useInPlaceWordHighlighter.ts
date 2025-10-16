import { useEffect, useRef, useMemo } from 'react';
import { segmentWords } from '@/utils/segment';
import { WordTiming } from '@/types/tts';

export const useInPlaceWordHighlighter = (
  containerRef: React.RefObject<HTMLElement>,
  timings: WordTiming[],
  currentTime: number,
  isActive: boolean,
  language?: string,
  mode: 'word' | 'sentence' = 'sentence', // Default to sentence mode
  leadTime: number = 0.4 // Lead time in seconds to trigger highlighting early
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

    // Walk through all text nodes and wrap based on mode (sentence or word)
    const wrapTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const text = textNode.nodeValue ?? '';
        
        if (!text.trim()) return;

        const fragment = document.createDocumentFragment();
        
        if (mode === 'sentence') {
          // Split by sentence boundaries (., !, ?)
          const sentences = text.split(/([.!?]+\s+)/);
          
          for (let i = 0; i < sentences.length; i++) {
            const part = sentences[i];
            if (!part) continue;
            
            // Check if this is actual sentence content (not just punctuation/whitespace)
            if (part.trim() && !/^[.!?\s]+$/.test(part)) {
              const span = document.createElement('span');
              span.textContent = part;
              span.setAttribute('data-segment', spans.length.toString());
              span.className = 'readable-segment';
              span.style.transition = 'background-color 0.2s ease';
              fragment.appendChild(span);
              spans.push(span);
            } else {
              // Keep punctuation and whitespace as-is
              fragment.appendChild(document.createTextNode(part));
            }
          }
        } else {
          // Word mode (original logic)
          const words = segmentWords(text, language);
          const parts = text.split(/(\s+)/);
          
          for (const part of parts) {
            if (!part) continue;
            
            if (/^\s+$/.test(part)) {
              fragment.appendChild(document.createTextNode(part));
            } else {
              const partWords = segmentWords(part, language);
              if (partWords.length > 0) {
                const span = document.createElement('span');
                span.textContent = part;
                span.setAttribute('data-segment', spans.length.toString());
                span.className = 'readable-segment';
                span.style.transition = 'background-color 0.12s ease';
                fragment.appendChild(span);
                spans.push(span);
              } else {
                fragment.appendChild(document.createTextNode(part));
              }
            }
          }
        }

        textNode.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
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

  // Calculate current segment index based on timing with lead time offset
  const currentSegmentIndex = useMemo(() => {
    if (!timings.length || !isActive) return -1;
    
    // Apply lead time to trigger highlighting earlier
    const adjustedTime = Math.max(0, currentTime + leadTime);
    let idx = timings.findIndex(w => adjustedTime >= w.start && adjustedTime < w.end);
    
    // If we're past all timings, highlight the last segment
    if (idx === -1 && adjustedTime >= timings[timings.length - 1]?.end) {
      idx = timings.length - 1;
    }
    
    return idx;
  }, [timings, currentTime, isActive, leadTime]);

  // Update highlighting based on current segment index
  useEffect(() => {
    if (!isBrowser || !isInitializedRef.current || wrappedSpansRef.current.length === 0) {
      return;
    }

    const spans = wrappedSpansRef.current;
    const prevIndex = lastHighlightedIndexRef.current;
    const newIndex = currentSegmentIndex;

    // Remove highlight from previous segment
    if (prevIndex >= 0 && prevIndex < spans.length) {
      const prevSpan = spans[prevIndex];
      prevSpan.removeAttribute('data-highlight');
      prevSpan.removeAttribute('aria-current');
      prevSpan.style.backgroundColor = '';
      prevSpan.style.borderRadius = '';
      prevSpan.style.padding = '';
    }

    // Add highlight to current segment
    if (newIndex >= 0 && newIndex < spans.length) {
      const currentSpan = spans[newIndex];
      currentSpan.setAttribute('data-highlight', 'true');
      currentSpan.setAttribute('aria-current', 'true');
      currentSpan.style.backgroundColor = 'rgba(59,130,246,0.35)';
      currentSpan.style.borderRadius = '3px';
      currentSpan.style.padding = '2px 4px';
    }

    lastHighlightedIndexRef.current = newIndex;
  }, [isBrowser, currentSegmentIndex]);

  // Clean up when not active
  useEffect(() => {
    if (!isBrowser || !isActive) {
      lastHighlightedIndexRef.current = -1;
      
      // Remove all highlights when not active
      if (isInitializedRef.current && wrappedSpansRef.current.length > 0) {
        wrappedSpansRef.current.forEach(span => {
          span.removeAttribute('data-highlight');
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

  // Return the currently highlighted segment index for external use (like auto-scroll)
  return { currentWordIndex: isActive ? currentSegmentIndex : -1 };
};