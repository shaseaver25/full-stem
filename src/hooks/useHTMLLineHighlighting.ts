import { useMemo, useRef, useEffect } from 'react';

export const useHTMLLineHighlighting = (
  htmlContent: string,
  cleanText: string,
  currentTime: number,
  duration: number,
  isPlaying: boolean
) => {
  const lastHighlightedIndex = useRef<number>(-1);
  const textElements = useRef<HTMLElement[]>([]);

  const highlightedHTML = useMemo(() => {
    if (!isPlaying || !duration || currentTime <= 0) {
      lastHighlightedIndex.current = -1;
      return htmlContent;
    }

    // Calculate progress as a percentage
    const progress = Math.min(currentTime / duration, 1);
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Get all text-containing elements (paragraphs, headings, etc.)
    const allElements = Array.from(tempDiv.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, span'))
      .filter(el => el.textContent && el.textContent.trim().length > 0) as HTMLElement[];

    // Calculate which element should be highlighted based on progress
    const targetIndex = Math.floor(progress * allElements.length);
    
    // Ensure we only move forward (prevent backward highlighting)
    const currentIndex = Math.max(targetIndex, lastHighlightedIndex.current);
    
    // Clear all existing highlights
    allElements.forEach(el => {
      el.removeAttribute('data-line-highlight');
      el.style.removeProperty('background-color');
      el.style.removeProperty('border-left');
      el.style.removeProperty('padding-left');
      el.style.removeProperty('border-radius');
      el.style.removeProperty('transition');
    });
    
    // Highlight the current element
    if (currentIndex >= 0 && currentIndex < allElements.length) {
      const elementToHighlight = allElements[currentIndex];
      elementToHighlight.setAttribute('data-line-highlight', 'true');
      elementToHighlight.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      elementToHighlight.style.borderLeft = '4px solid rgb(59, 130, 246)';
      elementToHighlight.style.paddingLeft = '12px';
      elementToHighlight.style.borderRadius = '4px';
      elementToHighlight.style.transition = 'all 0.3s ease';
      
      // Update the last highlighted index
      lastHighlightedIndex.current = currentIndex;
    }

    return tempDiv.innerHTML;
  }, [htmlContent, cleanText, currentTime, duration, isPlaying]);

  // Reset when playback stops
  useEffect(() => {
    if (!isPlaying) {
      lastHighlightedIndex.current = -1;
    }
  }, [isPlaying]);

  return highlightedHTML;
};