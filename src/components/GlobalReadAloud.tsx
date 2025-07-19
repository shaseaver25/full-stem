import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';
import { EnhancedReadAloud } from './EnhancedReadAloud';

interface GlobalReadAloudProps {
  className?: string;
}

const GlobalReadAloud: React.FC<GlobalReadAloudProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pageText, setPageText] = useState('');
  const [hasTextContent, setHasTextContent] = useState(false);

  // Extract text content from the current page
  const extractPageText = useCallback(() => {
    // Get main content areas, excluding navigation, headers, and UI elements
    const contentSelectors = [
      'main',
      '[role="main"]',
      '.lesson-content',
      '.content',
      'article',
      '.text-content',
      '[data-content]',
      '.prose',
      'p',
      // Add more specific selectors for your app's content areas
    ];

    let extractedText = '';

    // Try to find content in priority order
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          // Skip elements that are likely UI controls
          const excludeClasses = ['nav', 'header', 'footer', 'button', 'control', 'menu'];
          const hasExcludedClass = excludeClasses.some(cls => 
            element.className.toLowerCase().includes(cls)
          );
          
          if (!hasExcludedClass) {
            const text = element.textContent || '';
            if (text.trim().length > 50) { // Only include substantial text
              extractedText += text.trim() + ' ';
            }
          }
        });
        
        if (extractedText.trim().length > 100) {
          break; // Found substantial content
        }
      }
    }

    // Fallback: get all visible text from body, but filter out common UI elements
    if (extractedText.trim().length < 100) {
      const bodyText = document.body.textContent || '';
      const lines = bodyText.split('\n')
        .map(line => line.trim())
        .filter(line => {
          // Filter out common UI text patterns
          const uiPatterns = [
            /^(login|sign in|sign up|menu|navigation|home|about|contact)$/i,
            /^\d+$/, // Just numbers
            /^[<>]+$/, // Just arrows
            /^(©|copyright)/i,
            /^(privacy|terms|policy)/i
          ];
          
          return line.length > 20 && !uiPatterns.some(pattern => pattern.test(line));
        });
      
      extractedText = lines.join(' ');
    }

    return extractedText.trim();
  }, []);

  // Monitor page content changes
  useEffect(() => {
    const updatePageText = () => {
      const text = extractPageText();
      console.log('GlobalReadAloud: Extracted text length:', text.length);
      console.log('GlobalReadAloud: Has text content:', text.length > 100);
      setPageText(text);
      setHasTextContent(text.length > 100);
    };

    // Initial check
    updatePageText();

    // Monitor for content changes
    const observer = new MutationObserver(() => {
      // Debounce the update
      setTimeout(updatePageText, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [extractPageText]);

  // Don't render if there's no substantial text content
  if (!hasTextContent) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Floating trigger button when minimized */}
      {!isVisible && (
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      )}

      {/* Read aloud panel when visible */}
      {isVisible && (
        <Card className="w-96 max-w-[90vw] shadow-lg border">
          {/* Header with controls */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Read Aloud</span>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-8 w-8 p-0"
              >
                <VolumeX className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-3">
              <EnhancedReadAloud
                text={pageText}
                autoHighlight={true}
                showControls={true}
                theme="light"
                className="border-0 p-0"
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default GlobalReadAloud;