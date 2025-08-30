import { useMemo } from 'react';

export const useHTMLWordHighlighting = (
  htmlContent: string,
  cleanText: string,
  currentWordIndex: number,
  wordPositions: number[]
) => {
  const highlightedHTML = useMemo(() => {
    if (currentWordIndex < 0 || !cleanText) return htmlContent;

    // Split clean text into parts to find the current word
    const textParts = cleanText.split(/(\s+)/);
    const words: string[] = [];
    
    textParts.forEach((part) => {
      if (!part.match(/^\s*$/)) {
        words.push(part);
      }
    });

    const currentWord = words[currentWordIndex];
    if (!currentWord) return htmlContent;

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Function to recursively find and highlight text nodes
    const highlightTextNodes = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || '';
        if (textContent.includes(currentWord)) {
          // Create a more precise word boundary regex
          const wordRegex = new RegExp(`\\b${currentWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          if (wordRegex.test(textContent)) {
            const highlightedText = textContent.replace(
              wordRegex,
              `<mark class="bg-yellow-400 text-gray-900 font-semibold px-1 py-0.5 rounded-sm shadow-sm border-2 border-yellow-500 transition-all duration-200">$&</mark>`
            );
            
            // Replace the text node with highlighted version
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlightedText;
            node.parentNode?.replaceChild(wrapper, node);
          }
        }
      } else {
        // Recursively process child nodes
        Array.from(node.childNodes).forEach(child => {
          highlightTextNodes(child);
        });
      }
    };

    highlightTextNodes(tempDiv);
    return tempDiv.innerHTML;
  }, [htmlContent, cleanText, currentWordIndex, wordPositions]);

  return highlightedHTML;
};