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

  // Extract text content from the current page, focusing on lesson components
  const extractPageText = useCallback(() => {
    // Check if we're on a lesson page and prioritize lesson component content
    const isLessonPage = window.location.pathname.includes('/lesson/');
    
    if (isLessonPage) {
      // Target lesson component content specifically
      const lessonSelectors = [
        '[data-radix-scroll-area-content]', // Radix tabs content
        '[role="tabpanel"]', // Tab panels
        '.lesson-component-content',
        '[data-state="active"]', // Active tab content
        '.prose', // Rich text content
        'p', // Paragraphs within lesson content
      ];
      
      let extractedText = '';
      
      // Try to find active tab content first
      const activeTabPanel = document.querySelector('[role="tabpanel"][data-state="active"]');
      if (activeTabPanel) {
        const text = activeTabPanel.textContent || '';
        if (text.trim().length > 50) {
          extractedText = text.trim();
        }
      }
      
      // If no active tab content found, look for any tab panels
      if (!extractedText) {
        const tabPanels = document.querySelectorAll('[role="tabpanel"]');
        tabPanels.forEach(panel => {
          const text = panel.textContent || '';
          if (text.trim().length > 50) {
            extractedText += text.trim() + ' ';
          }
        });
      }
      
      // Fallback to lesson-specific selectors
      if (extractedText.trim().length < 100) {
        for (const selector of lessonSelectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            // Skip navigation and control elements
            const excludeClasses = ['nav', 'header', 'footer', 'button', 'control', 'menu', 'tabs-list'];
            const hasExcludedClass = excludeClasses.some(cls => 
              element.className.toLowerCase().includes(cls)
            );
            
            if (!hasExcludedClass) {
              const text = element.textContent || '';
              if (text.trim().length > 30) {
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