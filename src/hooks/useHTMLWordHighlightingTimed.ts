import { useMemo, useRef, useEffect } from 'react';
import { WordTiming } from '@/types/tts';

export const useHTMLWordHighlightingTimed = (
  htmlContent: string,
  timings: WordTiming[] | null,
  currentTime: number,
  isActive: boolean
) => {
  const lastIdx = useRef<number>(-1);
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  const highlighted = useMemo(() => {
    if (!htmlContent || !timings || !timings.length || !isActive || !isBrowser) {
      lastIdx.current = -1;
      return htmlContent;
    }
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    const spans: HTMLElement[] = [];
    const wrapTextNode = (node: Text) => {
      const txt = node.nodeValue ?? '';
      if (!txt.trim()) return;

      const frag = document.createDocumentFragment();
      const parts = txt.split(/(\s+)/); // keep whitespace tokens
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.textContent = part;
          span.className = 'readable-word';
          span.style.transition = 'background-color 0.12s ease';
          frag.appendChild(span);
          spans.push(span);
        }
      }
      node.replaceWith(frag);
    };

    const walk = (n: Node) => {
      if (n.nodeType === Node.TEXT_NODE) return wrapTextNode(n as Text);
      if (n.nodeType === Node.ELEMENT_NODE) {
        const kids = Array.from(n.childNodes);
        for (const c of kids) walk(c);
      }
    };
    walk(temp);

    // Choose word by current time
    const t = Math.max(0, currentTime);
    let idx = timings.findIndex(w => t >= w.start && t < w.end);
    if (idx === -1) idx = timings.length - 1; // end of audio

    // Reset styles
    spans.forEach(s => {
      s.removeAttribute('data-word-highlight');
      s.style.backgroundColor = '';
      s.style.borderRadius = '';
      s.style.padding = '';
    });

    // Apply highlight if in bounds (defensive: spans length may differ if HTML tokens differ)
    if (idx >= 0 && idx < spans.length) {
      const active = spans[idx];
      active.setAttribute('data-word-highlight', 'true');
      active.style.backgroundColor = 'rgba(59,130,246,0.35)';
      active.style.borderRadius = '3px';
      active.style.padding = '0 2px';
      lastIdx.current = idx;
    }

    return temp.innerHTML;
  }, [htmlContent, timings, currentTime, isActive]);

  useEffect(() => {
    if (!isActive) lastIdx.current = -1;
  }, [isActive]);

  return highlighted;
};