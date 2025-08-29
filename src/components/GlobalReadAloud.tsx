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
      
      // First, try to find the Instructions heading specifically
      const allElements = document.querySelectorAll('*');
      
      for (const element of allElements) {
        const textContent = element.textContent?.trim() || '';
        
        // Look for an element that contains "Instructions" as its main content
        if (textContent.toLowerCase() === 'instructions' || 
            (textContent.toLowerCase().includes('instructions') && textContent.length < 50)) {
          
          console.log('Found Instructions element:', element);
          
          // Get the parent container that has the instructions content
          let contentContainer = element.closest('[role="tabpanel"]') || 
                                element.closest('.lesson-content') ||
                                element.closest('div');
          
          if (contentContainer) {
            const fullText = contentContainer.textContent || '';
            const instructionsIndex = fullText.toLowerCase().indexOf('instructions');
            
            if (instructionsIndex !== -1) {
              // Get text after "instructions" heading
              let textAfterInstructions = fullText.substring(instructionsIndex + 12).trim();
              
              // Clean up the text - remove UI elements
              textAfterInstructions = textAfterInstructions
                .replace(/Enhanced Read Aloud.*?Download/g, '') // Remove read aloud controls
                .replace(/🎥Video🎯Activity✅Quick Check/g, '') // Remove tab navigation
                .replace(/Speed:\d+\.\dx/g, '') // Remove speed indicators
                .replace(/Emma \(Female, Clear\)/g, '') // Remove voice selection
                .replace(/🔊 Test Audio/g, '') // Remove test audio button
                .replace(/Play|Pause|Stop|Download/g, '') // Remove control buttons
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .trim();
              
              if (textAfterInstructions.length > 100) {
                extractedText = textAfterInstructions.substring(0, 2000);
                break;
              }
            }
          }
        }
      }
      
      // Fallback: Look for specific lesson content patterns
      if (!extractedText) {
        console.log('Fallback: Looking for lesson content patterns');
        const activeTab = document.querySelector('[role="tabpanel"][data-state="active"]');
        if (activeTab) {
          const content = activeTab.textContent || '';
          
          // Look for common lesson patterns
          const patterns = [
            /STEP \d+:/i,
            /Scenario:/i,
            /Instructions[\s\S]*?(?=Check-in|$)/i,
            /What You'll Need[\s\S]*?(?=Instructions|$)/i
          ];
          
          for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
              let cleanedContent = match[0]
                .replace(/Enhanced Read Aloud.*?Download/g, '')
                .replace(/🎥Video🎯Activity✅Quick Check/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              if (cleanedContent.length > 100) {
                extractedText = cleanedContent.substring(0, 2000);
                break;
              }
            }
          }
        }
      }
      
      console.log('Final extracted text preview:', extractedText.substring(0, 200));
      return extractedText;
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
          onClick={() => {
            console.log('GlobalReadAloud: Floating button clicked');
            setIsVisible(true);
          }}
          className="rounded-full w-16 h-16 shadow-2xl bg-blue-600 hover:bg-blue-700 text-white border-4 border-white pointer-events-auto animate-pulse hover:animate-none transition-all duration-300 hover:scale-110"
          size="sm"
          title="Click to open Enhanced Read Aloud"
        >
          <Volume2 className="h-7 w-7" />
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