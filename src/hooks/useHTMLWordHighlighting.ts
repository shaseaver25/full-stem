import { useMemo, useRef, useEffect } from 'react';

export const useHTMLWordHighlighting = (
  htmlContent: string,
  currentTime: number,
  duration: number,
  isActive: boolean
) => {
  const lastWordIndex = useRef<number>(-1);
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  const highlightedHTML = useMemo(() => {
    if (!htmlContent || !duration || (!isActive && currentTime <= 0) || !isBrowser) {
      lastWordIndex.current = -1;
      return htmlContent;
    }

    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    // Walk the DOM and wrap every non-whitespace token in a span
    const wordSpans: HTMLElement[] = [];
    const wordWeights: number[] = [];

    const wrapTextNode = (node: Text) => {
      const txt = node.nodeValue ?? '';
      if (!txt.trim()) return;

      const frag = document.createDocumentFragment();
      // Split into whitespace and non-whitespace tokens
      const parts = txt.split(/(\s+)/);

      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          // Preserve original whitespace
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.textContent = part;
          span.className = 'readable-word';
          // lightweight baseline style so layout doesn't jump when highlight toggles
          span.style.transition = 'background-color 0.12s ease';
          frag.appendChild(span);

          wordSpans.push(span);
          // Weight by character count (strip punctuation) so longer words take a tad longer
          const w = part.replace(/[^\p{L}\p{N}]/gu, '').length || 1;
          wordWeights.push(w);
        }
      }
      node.replaceWith(frag);
    };

    const walk = (n: Node) => {
      if (n.nodeType === Node.TEXT_NODE) {
        wrapTextNode(n as Text);
        return;
      }
      if (n.nodeType === Node.ELEMENT_NODE) {
        // Recurse through children safely (childNodes is live, so copy first)
        const kids = Array.from(n.childNodes);
        for (const child of kids) walk(child);
      }
    };

    walk(temp);

    if (wordSpans.length === 0) {
      lastWordIndex.current = -1;
      return htmlContent;
    }

    // Compute progress across words by their weights
    const totalWeight = wordWeights.reduce((a, b) => a + b, 0);
    const progress = Math.max(0, Math.min(currentTime / duration, 1));
    const target = progress * totalWeight;

    let cum = 0;
    let idx = 0;
    for (let i = 0; i < wordWeights.length; i++) {
      cum += wordWeights[i];
      if (target <= cum) { idx = i; break; }
      if (i === wordWeights.length - 1) idx = i;
    }

    // Clear any previous highlight
    for (const span of wordSpans) {
      span.removeAttribute('data-word-highlight');
      span.style.backgroundColor = '';
      span.style.borderRadius = '';
      span.style.padding = '';
      span.style.boxShadow = '';
    }

    // Highlight current word
    const active = wordSpans[idx];
    active.setAttribute('data-word-highlight', 'true');
    active.style.backgroundColor = 'rgba(59,130,246,0.35)'; // blue-500 ~35%
    active.style.borderRadius = '3px';
    active.style.padding = '0 2px';

    lastWordIndex.current = idx;

    return temp.innerHTML;
  }, [htmlContent, currentTime, duration, isActive]);

  useEffect(() => {
    if (!isActive) lastWordIndex.current = -1;
  }, [isActive]);

  return highlightedHTML;
};