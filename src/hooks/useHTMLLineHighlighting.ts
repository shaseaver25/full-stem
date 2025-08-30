import { useMemo, useRef, useEffect } from 'react';

export const useHTMLLineHighlighting = (
  htmlContent: string,
  cleanText: string,          // kept for signature compatibility
  currentTime: number,
  duration: number,
  isPlaying: boolean
) => {
  const lastIndexRef = useRef<number>(-1);
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  const highlightedHTML = useMemo(() => {
    if (!htmlContent || !duration || (!isPlaying && currentTime <= 0) || !isBrowser) {
      lastIndexRef.current = -1;
      return htmlContent;
    }

    // Clamp progress [0,1]
    const progress = Math.max(0, Math.min(duration ? currentTime / duration : 0, 1));

    // Parse the incoming HTML
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    // Treat each block of readable text as a "line"
    const selector = [
      'p','li','blockquote',
      'h1','h2','h3','h4','h5','h6',
      'article','section','div'
    ].join(',');

    const blocks = Array.from(temp.querySelectorAll<HTMLElement>(selector))
      // keep only blocks that actually contain readable text
      .filter(el => (el.textContent || '').trim().length > 0);

    if (blocks.length === 0) {
      lastIndexRef.current = -1;
      return htmlContent;
    }

    // Weight each line by its text length (approx reading time)
    const weights = blocks.map(el => {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      // word-count weight (>=1 to avoid zero-length)
      const wc = Math.max(1, text.split(' ').length);
      return wc;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const target = progress * totalWeight;

    // Find the line whose cumulative weight crosses the target
    let cum = 0;
    let idx = 0;
    for (let i = 0; i < weights.length; i++) {
      cum += weights[i];
      if (target <= cum) {
        idx = i;
        break;
      }
      // if progress === 1, ensure we end on the last line
      if (i === weights.length - 1) idx = i;
    }

    // Clear previous highlight attributes/styles
    for (const el of blocks) {
      el.removeAttribute('data-line-index');
      el.removeAttribute('data-line-highlight');
      el.style.removeProperty('background-color');
      el.style.removeProperty('border-left');
      el.style.removeProperty('padding-left');
      el.style.removeProperty('border-radius');
      el.style.removeProperty('transition');
    }

    // Apply highlight to the chosen line
    const active = blocks[idx];
    active.setAttribute('data-line-index', String(idx));
    active.setAttribute('data-line-highlight', 'true');
    active.style.backgroundColor = 'rgba(59, 130, 246, 0.12)'; // tailwind blue-500 @ ~12%
    active.style.borderLeft = '4px solid rgb(59, 130, 246)';
    active.style.paddingLeft = '12px';
    active.style.borderRadius = '4px';
    active.style.transition = 'all 0.2s ease';

    lastIndexRef.current = idx;

    return temp.innerHTML;
  }, [htmlContent, cleanText, currentTime, duration, isPlaying]);

  // Reset when playback stops
  useEffect(() => {
    if (!isPlaying) lastIndexRef.current = -1;
  }, [isPlaying]);

  return highlightedHTML;
};
