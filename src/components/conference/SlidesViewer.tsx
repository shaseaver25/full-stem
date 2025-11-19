import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize,
  Home,
  Volume2,
  VolumeX,
  Pause,
  Play,
  HelpCircle,
  X,
  Languages
} from 'lucide-react';
import { usePresentationTTS } from '@/hooks/usePresentationTTS';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import { HighlightedText } from '@/components/lesson/HighlightedText';
import { cn } from '@/lib/utils';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];

interface SlidesViewerProps {
  sessionTitle: string;
  targetLanguage?: string;
  embedUrl?: string;
  slides?: Array<{ slideNumber: number; title: string; content: string; }>;
}

const SlidesViewer: React.FC<SlidesViewerProps> = ({ 
  sessionTitle, 
  targetLanguage = 'en',
  embedUrl,
  slides = []
}) => {
  console.log('SlidesViewer received:', { 
    sessionTitle, 
    slidesCount: slides.length, 
    hasEmbedUrl: !!embedUrl,
    firstSlide: slides[0]
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([0]));
  const [translatedSlides, setTranslatedSlides] = useState<Map<number, string>>(new Map());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const { speak, pause, resume, stop, isPlaying, isPaused, isLoading: isSpeaking, currentWordIndex, wordTimings } = usePresentationTTS();
  const { translateText, isTranslating } = useLiveTranslation();

  // Total slides from either slide data or default to 10
  const totalSlides = slides.length > 0 ? slides.length : 10;
  const progressPercentage = ((currentSlide + 1) / totalSlides) * 100;
  const isCompleted = viewedSlides.size === totalSlides;

  // Get current slide content
  const currentSlideData = slides[currentSlide];
  const currentSlideContent = currentSlideData ? `${currentSlideData.title}. ${currentSlideData.content}` : `Slide ${currentSlide + 1} of the presentation: ${sessionTitle}`;

  console.log('Current slide info:', {
    currentSlide,
    currentSlideData,
    currentSlideContent: currentSlideContent.substring(0, 100) + '...'
  });

  // Mark slide as viewed
  useEffect(() => {
    setViewedSlides(prev => new Set(prev).add(currentSlide));
    // Stop any ongoing playback when slide changes
    if (isPlaying) {
      stop();
    }
  }, [currentSlide]);

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    console.log('goToSlide called:', { index, currentSlide, totalSlides });
    if (index >= 0 && index < totalSlides) {
      console.log('Setting currentSlide to:', index);
      setCurrentSlide(index);
      const announcement = `Slide ${index + 1} of ${totalSlides}`;
      const liveRegion = document.getElementById('slide-announcer');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    } else {
      console.log('Navigation blocked - out of range:', { index, totalSlides });
    }
  }, [totalSlides, currentSlide]);

  const goToPrevious = useCallback(() => {
    console.log('goToPrevious clicked - currentSlide:', currentSlide);
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const goToNext = useCallback(() => {
    console.log('goToNext clicked - currentSlide:', currentSlide);
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const goToFirst = useCallback(() => {
    goToSlide(0);
  }, [goToSlide]);

  const goToLast = useCallback(() => {
    goToSlide(totalSlides - 1);
  }, [totalSlides, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goToNext();
          break;
        case 'Home':
          e.preventDefault();
          goToFirst();
          break;
        case 'End':
          e.preventDefault();
          goToLast();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          } else if (showKeyboardHelp) {
            e.preventDefault();
            setShowKeyboardHelp(false);
          }
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, totalSlides, isFullscreen, showKeyboardHelp, goToPrevious, goToNext, goToFirst, goToLast]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Language change handler - translates ALL slides with delays
  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    
    if (langCode !== 'en') {
      const languageName = SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name || langCode;
      const translationsMap = new Map<number, string>();
      
      // Translate all slides with a small delay between each to avoid rate limits
      for (let i = 0; i < slides.length; i++) {
        const slideData = slides[i];
        const slideContent = `${slideData.title}. ${slideData.content}`;
        
        try {
          const translated = await translateText({
            text: slideContent,
            targetLanguage: languageName,
            sourceLanguage: 'auto'
          });
          if (translated) {
            translationsMap.set(i, translated);
          }
        } catch (error) {
          console.error(`Failed to translate slide ${i + 1}:`, error);
        }
        
        // Add 300ms delay between translations to avoid rate limits
        if (i < slides.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      setTranslatedSlides(translationsMap);
    } else {
      setTranslatedSlides(new Map());
    }
  };

  // Read aloud
  const handleReadAloud = async () => {
    const translatedText = translatedSlides.get(currentSlide);
    const textToRead = (selectedLanguage !== 'en' && translatedText) ? translatedText : currentSlideContent;
    await speak(textToRead);
  };


  // Touch gesture support
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        goToNext();
      }
      if (touchEndX - touchStartX > swipeThreshold) {
        goToPrevious();
      }
    };

    const container = document.getElementById('presentation-container');
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [goToNext, goToPrevious]);

  const translatedText = translatedSlides.get(currentSlide);
  const displayContent = (selectedLanguage !== 'en' && translatedText) ? translatedText : currentSlideContent;

  console.log('Slides Viewer Debug:', {
    currentSlide,
    hasSlides: slides.length > 0,
    currentSlideData,
    currentSlideContent,
    displayContent,
    totalSlides
  });

  return (
    <div 
      className={cn(
        "relative",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
      id="presentation-container"
      role="region"
      aria-label={`Presentation viewer: ${sessionTitle}`}
      aria-describedby="presentation-description"
    >
      {/* Screen reader description */}
      <div id="presentation-description" className="sr-only">
        Interactive presentation with {totalSlides} slides. 
        Use arrow keys or Tab to navigate. Press question mark for keyboard shortcuts.
      </div>

      {/* Screen reader announcer */}
      <div 
        id="slide-announcer" 
        className="sr-only" 
        role="status" 
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Top Controls Bar */}
      <nav className="flex items-center justify-between gap-2 p-3 border-b bg-card" role="toolbar" aria-label="Presentation controls">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToFirst}
            disabled={currentSlide === 0}
            aria-label="Go to first slide"
            title="Go to first slide (Home key)"
          >
            <Home className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            aria-label="Show keyboard shortcuts"
            aria-pressed={showKeyboardHelp}
            title="Keyboard shortcuts (Press ? key)"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 text-center">
          <h1 className="font-semibold text-sm">{sessionTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
            aria-pressed={isFullscreen}
            title={isFullscreen ? "Exit fullscreen (ESC)" : "Enter fullscreen (F key)"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="px-3 py-2 bg-card border-b" role="region" aria-label="Presentation progress">
        <div className="flex items-center gap-3">
          <Progress 
            value={progressPercentage} 
            className="flex-1" 
            aria-label={`Presentation progress: ${Math.round(progressPercentage)} percent complete`}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Main Slide View */}
      <main className="relative flex items-center justify-center min-h-[400px] bg-muted/30" role="main">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-4 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg",
            currentSlide === 0 && "opacity-50"
          )}
          onClick={goToPrevious}
          disabled={currentSlide === 0}
          aria-label={`Previous slide. Currently on slide ${currentSlide + 1} of ${totalSlides}`}
          title="Previous slide (Left arrow key)"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Slide Content */}
        <div className="w-full max-w-5xl p-4 sm:p-8 space-y-4">
          {embedUrl ? (
            <>
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg min-h-[300px] sm:min-h-[400px]">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  title={`${sessionTitle} - Slide ${currentSlide + 1}`}
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  aria-label={`Slide ${currentSlide + 1} of ${totalSlides}`}
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              </div>

              {/* Navigation Instructions Banner */}
              <div className="mt-4 p-4 border rounded-lg bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-primary">How to Navigate</h3>
                    <p className="text-xs text-muted-foreground">
                      Use the <strong>circular arrow buttons on the left and right</strong> of the slides to navigate and update the text below. 
                      You can also use <strong>keyboard arrow keys</strong> or press <strong>?</strong> for more shortcuts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Slide Text Panel - Shows current slide text with TTS controls */}
              {displayContent && (
                <Card className="mt-4">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Volume2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Slide {currentSlide + 1} Content</h3>
                          <p className="text-xs text-muted-foreground">Text with word-by-word highlighting</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
                          <SelectTrigger 
                            className="w-40" 
                            aria-label={`Select language. Currently ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}`}
                          >
                            <Languages className="h-4 w-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_LANGUAGES.map(lang => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedLanguage !== 'en' && translatedSlides.size > 0 && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            Translated ({translatedSlides.size}/{slides.length})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-sm leading-relaxed">
                        <HighlightedText 
                          text={displayContent}
                          currentWordIndex={currentWordIndex}
                          wordTimings={wordTimings}
                        />
                      </p>
                    </div>
                    
                    {/* TTS Controls */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {!isPlaying ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReadAloud}
                          disabled={isSpeaking}
                          aria-label="Read slide aloud"
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          Read Aloud
                        </Button>
                      ) : isPaused ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resume}
                          aria-label="Resume reading"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={pause}
                          aria-label="Pause reading"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      
                      {isPlaying && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stop}
                          aria-label="Stop reading"
                        >
                          <VolumeX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="text-6xl font-bold text-primary/20">
                  {currentSlide + 1}
                </div>
                <p className="text-sm text-muted-foreground max-w-md">
                  {currentSlideData ? currentSlideData.title : `Slide ${currentSlide + 1}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-4 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg",
            currentSlide === totalSlides - 1 && "opacity-50"
          )}
          onClick={goToNext}
          disabled={currentSlide === totalSlides - 1}
          aria-label={`Next slide. Currently on slide ${currentSlide + 1} of ${totalSlides}`}
          title="Next slide (Right arrow or Space key)"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </main>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between p-3 border-t bg-card">
        <div className="text-sm">
          Slide <span className="text-primary font-medium">{currentSlide + 1}</span> of {totalSlides}
        </div>
        <div className="text-xs text-muted-foreground">
          {!isCompleted ? (
            <>View all slides to complete ({viewedSlides.size}/{totalSlides} viewed)</>
          ) : (
            <>✓ All slides viewed</>
          )}
        </div>
      </div>

      {/* Keyboard Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowKeyboardHelp(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next slide</span>
                <kbd className="px-2 py-1 bg-muted rounded">→</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previous slide</span>
                <kbd className="px-2 py-1 bg-muted rounded">←</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">First slide</span>
                <kbd className="px-2 py-1 bg-muted rounded">Home</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last slide</span>
                <kbd className="px-2 py-1 bg-muted rounded">End</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fullscreen</span>
                <kbd className="px-2 py-1 bg-muted rounded">F</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exit fullscreen</span>
                <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidesViewer;
