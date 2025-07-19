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

  // Extract text content from the current page, focusing on content after "Instructions" title
  const extractPageText = useCallback(() => {
    // Check if we're on a lesson page and look for content after Instructions
    const isLessonPage = window.location.pathname.includes('/lesson/');
    
    if (isLessonPage) {
      let extractedText = '';
      
      console.log('GlobalReadAloud: Looking for Instructions on lesson page');
      
      // First, look for Instructions heading and extract content after it
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .text-xl, .text-lg, .font-semibold, .font-bold');
      console.log('GlobalReadAloud: Found headings:', allHeadings.length);
      
      for (const heading of allHeadings) {
        const headingText = heading.textContent?.trim().toLowerCase() || '';
        console.log('GlobalReadAloud: Checking heading:', headingText);
        
        if (headingText.includes('instructions')) {
          console.log('GlobalReadAloud: Found Instructions heading!');
          // Found the Instructions heading, now get content after it
          let currentElement = heading.nextElementSibling;
          
          while (currentElement) {
            // Skip navigation and control elements
            const excludeClasses = ['nav', 'header', 'footer', 'button', 'control', 'menu', 'tabs-list'];
            const hasExcludedClass = excludeClasses.some(cls => 
              currentElement.className?.toLowerCase().includes(cls)
            );
            
            if (!hasExcludedClass) {
              const text = currentElement.textContent || '';
              if (text.trim().length > 10) {
                extractedText += text.trim() + ' ';
              }
            }
            
            currentElement = currentElement.nextElementSibling;
          }
          
          if (extractedText.trim().length > 50) {
            break;
          }
        }
      }
      
      // If no Instructions heading found, look in active tab panels for Instructions text
      if (!extractedText) {
        console.log('GlobalReadAloud: No Instructions heading found, checking tab panels');
        const tabPanels = document.querySelectorAll('[role="tabpanel"]');
        console.log('GlobalReadAloud: Found tab panels:', tabPanels.length);
        
        for (const panel of tabPanels) {
          const allText = panel.textContent || '';
          const instructionsIndex = allText.toLowerCase().indexOf('instructions');
          
          if (instructionsIndex !== -1) {
            console.log('GlobalReadAloud: Found Instructions text in tab panel');
            // Extract text after "instructions"
            const textAfterInstructions = allText.substring(instructionsIndex + 12); // 12 = length of "instructions"
            if (textAfterInstructions.trim().length > 50) {
              extractedText = textAfterInstructions.trim();
              break;
            }
          }
        }
      }
      
      // If still no Instructions found, fall back to active tab content for debugging
      if (!extractedText) {
        console.log('GlobalReadAloud: No Instructions found, falling back to active tab content');
        const activeTabPanel = document.querySelector('[role="tabpanel"][data-state="active"]');
        if (activeTabPanel) {
          const text = activeTabPanel.textContent || '';
          console.log('GlobalReadAloud: Active tab content length:', text.length);
          if (text.trim().length > 100) {
            extractedText = text.trim();
          }
        }
      }
      
      console.log('GlobalReadAloud: Final extracted text length:', extractedText.length);
      return extractedText.trim();
    }
    
    // Original logic for non-lesson pages
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
    ];

    let extractedText = '';

    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          const excludeClasses = ['nav', 'header', 'footer', 'button', 'control', 'menu'];
          const hasExcludedClass = excludeClasses.some(cls => 
            element.className.toLowerCase().includes(cls)
          );
          
          if (!hasExcludedClass) {
            const text = element.textContent || '';
            if (text.trim().length > 50) {
              extractedText += text.trim() + ' ';
            }
          }
        });
        
        if (extractedText.trim().length > 100) {
          break;
        }
      }
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

  console.log('GlobalReadAloud: Rendering component. hasTextContent:', hasTextContent, 'pageText length:', pageText.length);

  // Don't render if there's no substantial text content
  if (!hasTextContent) {
    console.log('GlobalReadAloud: Not rendering - no text content detected');
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-[9999] pointer-events-none ${className}`}>
      {/* Floating trigger button when minimized */}
      {!isVisible && (
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full w-14 h-14 shadow-xl bg-primary hover:bg-primary/90 border-2 border-white pointer-events-auto animate-fade-in"
          size="sm"
        >
          <Volume2 className="h-6 w-6" />
        </Button>
      )}

      {/* Read aloud panel when visible */}
      {isVisible && (
        <Card className="w-[420px] max-w-[90vw] shadow-xl border-2 pointer-events-auto animate-scale-in">
          {/* Header with controls */}
          <div className="flex items-center justify-between p-3 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <span className="font-semibold text-base">Enhanced Read Aloud</span>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-8 w-8 p-0"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-4 max-h-96 overflow-y-auto">
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