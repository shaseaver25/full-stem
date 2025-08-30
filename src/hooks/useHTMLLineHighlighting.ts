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

    // Split clean text into sentences/lines for better line detection
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Calculate which sentence/line we're currently on
    const progress = currentTime / duration;
    const currentSentenceIndex = Math.floor(progress * sentences.length);
    
    if (currentSentenceIndex >= sentences.length || currentSentenceIndex < 0) {
      return htmlContent;
    }

    const currentSentence = sentences[currentSentenceIndex]?.trim();
    if (!currentSentence) return htmlContent;

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Function to find and highlight the current sentence
    const highlightCurrentSentence = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || '';
        
        // Check if this text node contains part of the current sentence
        if (textContent.includes(currentSentence.substring(0, 20))) { // Check first 20 chars
          // Find the parent element that contains the full sentence
          let parentElement = node.parentElement;
          while (parentElement && parentElement !== tempDiv) {
            const parentText = parentElement.textContent || '';
            if (parentText.includes(currentSentence)) {
              // Add highlighting class to this element
              parentElement.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
              parentElement.style.borderLeft = '4px solid rgb(59, 130, 246)';
              parentElement.style.paddingLeft = '12px';
              parentElement.style.borderRadius = '4px';
              parentElement.style.transition = 'all 0.3s ease';
              return true;
            }
            parentElement = parentElement.parentElement;
          }
        }
      } else {
        // Recursively process child nodes
        for (const child of Array.from(node.childNodes)) {
          if (highlightCurrentSentence(child)) {
            return true; // Stop after first match
          }
        }
      }
      return false;
    };

    highlightCurrentSentence(tempDiv);
    return tempDiv.innerHTML;
  }, [htmlContent, cleanText, currentTime, duration, isPlaying]);

  return highlightedHTML;
};