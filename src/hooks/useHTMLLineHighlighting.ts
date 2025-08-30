import { useMemo } from 'react';

export const useHTMLLineHighlighting = (
  htmlContent: string,
  cleanText: string,
  currentTime: number,
  duration: number,
  isPlaying: boolean
) => {
  const highlightedHTML = useMemo(() => {
    if (!isPlaying || !duration || currentTime <= 0) return htmlContent;

    // Split clean text into words to calculate progress more granularly
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    
    // Calculate which word we're currently on
    const progress = currentTime / duration;
    const currentWordIndex = Math.floor(progress * totalWords);
    
    if (currentWordIndex >= totalWords || currentWordIndex < 0) {
      return htmlContent;
    }

    // Get the current word being spoken
    const currentWord = words[currentWordIndex];
    if (!currentWord) return htmlContent;

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Function to find and highlight the line containing the current word
    const highlightCurrentLine = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || '';
        
        // Check if this text node contains the current word
        const wordPattern = currentWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${wordPattern}\\b`, 'i');
        
        if (regex.test(textContent)) {
          // Find the closest block-level parent or create a line wrapper
          let lineElement = node.parentElement;
          
          // Look for a suitable parent element (p, div, span, etc.)
          while (lineElement && lineElement !== tempDiv) {
            if (lineElement.tagName && ['P', 'DIV', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(lineElement.tagName)) {
              break;
            }
            lineElement = lineElement.parentElement;
          }
          
          if (lineElement && lineElement !== tempDiv) {
            // Clear any existing highlights first
            const allElements = tempDiv.querySelectorAll('[data-line-highlight]');
            allElements.forEach(el => {
              el.removeAttribute('data-line-highlight');
              const htmlEl = el as HTMLElement;
              htmlEl.style.removeProperty('background-color');
              htmlEl.style.removeProperty('border-left');
              htmlEl.style.removeProperty('padding-left');
              htmlEl.style.removeProperty('border-radius');
              htmlEl.style.removeProperty('transition');
            });
            
            // Add highlighting to current line
            lineElement.setAttribute('data-line-highlight', 'true');
            const htmlLineElement = lineElement as HTMLElement;
            htmlLineElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            htmlLineElement.style.borderLeft = '4px solid rgb(59, 130, 246)';
            htmlLineElement.style.paddingLeft = '12px';
            htmlLineElement.style.borderRadius = '4px';
            htmlLineElement.style.transition = 'all 0.3s ease';
            return true;
          }
        }
      } else {
        // Recursively process child nodes
        for (const child of Array.from(node.childNodes)) {
          if (highlightCurrentLine(child)) {
            return true; // Stop after first match
          }
        }
      }
      return false;
    };

    highlightCurrentLine(tempDiv);
    return tempDiv.innerHTML;
  }, [htmlContent, cleanText, currentTime, duration, isPlaying]);

  return highlightedHTML;
};