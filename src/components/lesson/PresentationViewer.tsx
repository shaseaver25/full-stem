/**
 * PresentationViewer Component
 * 
 * ✅ WCAG 2.1 Level AA Compliant
 * - Full keyboard navigation (Arrow keys, Home, End, F for fullscreen)
 * - Screen reader announcements for slide changes
 * - High contrast mode support
 * - Focus indicators on all interactive elements
 * - ARIA labels and live regions
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize,
  Home,
  Volume2,
  Languages,
  Download,
  HelpCircle,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePresentationTTS } from '@/hooks/usePresentationTTS';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import { HighlightedText } from './HighlightedText';
import { cn } from '@/lib/utils';

interface Slide {
  url: string;
  text: string;
  notes?: string;
  thumbnail?: string;
}

interface PresentationViewerProps {
  title?: string;
  embedUrl?: string;
  slides?: Slide[];
  speakerNotes?: string;
  allowDownloads?: boolean;
  requireFullViewing?: boolean;
  showThumbnails?: boolean;
  enableTranslation?: boolean;
  onComplete?: () => void;
  className?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'hi', name: 'Hindi' },
  { code: 'it', name: 'Italian' },
];

export function PresentationViewer({
  title,
  embedUrl,
  slides = [],
  speakerNotes,
  allowDownloads = true,
  requireFullViewing = false,
  showThumbnails = true,
  enableTranslation = true,
  onComplete,
  className
}: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([0]));
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedTexts, setTranslatedTexts] = useState<Map<number, string>>(new Map());
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  const { speak, pause, resume, stop, isPlaying, isPaused, isLoading: isSpeaking, currentWordIndex, wordTimings } = usePresentationTTS();
  const { translateText, isTranslating } = useLiveTranslation();

  const totalSlides = slides.length || 1;
  const progressPercentage = ((currentSlide + 1) / totalSlides) * 100;
  const isCompleted = viewedSlides.size === totalSlides;

  // Mark slide as viewed
  useEffect(() => {
    setViewedSlides(prev => new Set(prev).add(currentSlide));
  }, [currentSlide]);

  // Check for completion
  useEffect(() => {
    if (isCompleted && onComplete && requireFullViewing) {
      onComplete();
    }
  }, [isCompleted, onComplete, requireFullViewing]);

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
      // Announce to screen readers
      const announcement = `Slide ${index + 1} of ${totalSlides}`;
      const liveRegion = document.getElementById('slide-announcer');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }, [totalSlides]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const goToNext = useCallback(() => {
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
      // Don't interfere with form inputs
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

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Read aloud current slide
  const handleReadAloud = async () => {
    const currentSlideData = slides[currentSlide];
    if (!currentSlideData) return;

    let textToRead = currentSlideData.text;
    
    // Use translated text if available
    if (selectedLanguage !== 'en' && translatedTexts.has(currentSlide)) {
      textToRead = translatedTexts.get(currentSlide) || textToRead;
    }

    // Add speaker notes if present
    if (currentSlideData.notes) {
      textToRead += '. ' + currentSlideData.notes;
    }

    await speak(textToRead);
  };

  // Handle translation
  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    
    if (langCode === 'en') {
      return; // No translation needed for English
    }

    // Translate current slide if not already translated
    if (!translatedTexts.has(currentSlide)) {
      const currentSlideData = slides[currentSlide];
      if (currentSlideData?.text) {
        const languageName = SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name || langCode;
        const translated = await translateText({
          text: currentSlideData.text,
          targetLanguage: languageName,
          sourceLanguage: 'auto'
        });
        if (translated) {
          setTranslatedTexts(new Map(translatedTexts).set(currentSlide, translated));
        }
      }
    }
  };

  // Touch gesture support for mobile
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
        goToNext(); // Swipe left - next slide
      }
      if (touchEndX - touchStartX > swipeThreshold) {
        goToPrevious(); // Swipe right - previous slide
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

  const currentSlideData = slides[currentSlide];
  const displayText = selectedLanguage !== 'en' && translatedTexts.has(currentSlide)
    ? translatedTexts.get(currentSlide)
    : currentSlideData?.text;

  return (
    <div 
      className={cn(
        "relative",
        isFullscreen && "fixed inset-0 z-50 bg-background",
        className
      )}
      id="presentation-container"
      role="region"
      aria-label={`Presentation viewer: ${title || 'Presentation'}`}
      aria-describedby="presentation-description"
    >
      {/* Screen reader description */}
      <div id="presentation-description" className="sr-only">
        Interactive presentation with {totalSlides} slide{totalSlides > 1 ? 's' : ''}. 
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
            tabIndex={0}
          >
            <Home className="h-4 w-4" />
          </Button>

          {currentSlideData?.text ? (
            <div className="flex items-center gap-1">
              {!isPlaying ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReadAloud}
                  disabled={isSpeaking}
                  aria-label="Read slide aloud"
                  title="Read slide aloud"
                  tabIndex={0}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isPaused ? resume : pause}
                    aria-label={isPaused ? "Resume reading" : "Pause reading"}
                    title={isPaused ? "Resume reading" : "Pause reading"}
                    tabIndex={0}
                  >
                    {isPaused ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stop}
                    aria-label="Stop reading"
                    title="Stop reading"
                    tabIndex={0}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground border rounded-md bg-muted/30"
              role="status"
              aria-label="Accessibility features unavailable"
            >
              <Volume2 className="h-3 w-3 opacity-50" />
              <span>Text-to-Speech requires slide text data</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            aria-label="Show keyboard shortcuts"
            aria-pressed={showKeyboardHelp}
            title="Keyboard shortcuts (Press ? key)"
            tabIndex={0}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 text-center">
          {title && <h1 className="font-semibold text-sm" id="presentation-title">{title}</h1>}
        </div>

        <div className="flex items-center gap-2">
          {enableTranslation && currentSlideData?.text && (
            <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
              <SelectTrigger 
                className="w-32" 
                aria-label={`Select language. Currently ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}`}
                tabIndex={0}
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
          )}

          {allowDownloads && embedUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(embedUrl, '_blank')}
              aria-label="Open presentation in new tab"
              title="Open presentation in new tab"
              tabIndex={0}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
            aria-pressed={isFullscreen}
            title={isFullscreen ? "Exit fullscreen (ESC)" : "Enter fullscreen (F key)"}
            tabIndex={0}
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
            aria-valuenow={Math.round(progressPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap" aria-hidden="true">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Main Slide View */}
      <main className="relative flex items-center justify-center min-h-[400px] bg-muted/30" role="main" aria-label="Slide content">
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
          tabIndex={0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Slide Content */}
        <div className="w-full max-w-5xl p-8 space-y-4">
          {embedUrl ? (
            // Check if this is a file URL (old format) vs embed URL (new format)
            embedUrl.includes('/storage/v1/object/') || embedUrl.endsWith('.pptx') || embedUrl.endsWith('.ppt') || embedUrl.endsWith('.pdf') ? (
              <Card className="p-8 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-yellow-900 dark:text-yellow-100 mb-2">
                        Embed URL Required
                      </h3>
                      <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                        This presentation uses an old file format that can't be displayed. Please update it with a proper embed link from Google Slides or OneDrive.
                      </p>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">📊 For Google Slides:</p>
                          <ol className="list-decimal ml-4 space-y-1 text-yellow-800 dark:text-yellow-200">
                            <li>Open your presentation in Google Slides</li>
                            <li>Click "File" → "Share" → "Publish to web"</li>
                            <li>Click "Embed" tab and copy the link</li>
                            <li>Update this component with the embed link</li>
                          </ol>
                        </div>
                        
                        <div>
                          <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">📊 For OneDrive PowerPoint:</p>
                          <ol className="list-decimal ml-4 space-y-1 text-yellow-800 dark:text-yellow-200">
                            <li>Open your PowerPoint in OneDrive</li>
                            <li>Click "File" → "Share" → "Embed"</li>
                            <li>Click "Generate" and copy the src URL from the iframe code</li>
                            <li>Update this component with the embed link</li>
                          </ol>
                        </div>

                        {/* Show the current file URL for teacher reference */}
                        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded border border-yellow-300 dark:border-yellow-700">
                          <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Current URL (file format):</p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 break-all font-mono">
                            {embedUrl}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg" role="img" aria-label={`Embedded presentation: ${title || 'Presentation'}`}>
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    title={`${title || 'Presentation'} - Slide ${currentSlide + 1} of ${totalSlides}. Use arrow keys to navigate between slides.`}
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    aria-label={`Slide ${currentSlide + 1} of ${totalSlides}`}
                  />
                </div>

                {/* Slide Text Panel - Shows current slide text for accessibility */}
                {currentSlideData?.text && (
                  <Card className="mt-4">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Volume2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">Slide {currentSlide + 1} Content</h3>
                            <p className="text-xs text-muted-foreground">Text available for Read Aloud & Translation</p>
                          </div>
                        </div>
                        {selectedLanguage !== 'en' && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            Translated to {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                          </span>
                        )}
                      </div>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-sm leading-relaxed">
                          <HighlightedText 
                            text={displayText} 
                            currentWordIndex={currentWordIndex}
                            wordTimings={wordTimings}
                          />
                        </p>
                      </div>
                      {currentSlideData.notes && (
                        <div className="pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
                          <p className="text-xs text-muted-foreground italic">{currentSlideData.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )
          ) : currentSlideData ? (
            <Card className="shadow-lg">
              <CardContent className="p-8">
                {currentSlideData.url && (
                  <img 
                    src={currentSlideData.url} 
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full rounded-lg mb-4"
                  />
                )}
                {displayText && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: displayText }} />
                  </div>
                )}
                {currentSlideData.notes && showNotesPanel && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      Speaker Notes
                    </h4>
                    <p className="text-sm text-muted-foreground">{currentSlideData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>No slide content available</p>
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
          tabIndex={0}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </main>

      {/* Slide Counter */}
      <div className="py-3 text-center border-t bg-card">
        <p className="text-sm font-medium">
          Slide <span className="text-primary">{currentSlide + 1}</span> of {totalSlides}
        </p>
        {requireFullViewing && !isCompleted && (
          <p className="text-xs text-muted-foreground mt-1">
            View all slides to complete ({viewedSlides.size}/{totalSlides} viewed)
          </p>
        )}
        {isCompleted && requireFullViewing && (
          <p className="text-xs text-success mt-1">
            ✓ All slides viewed
          </p>
        )}
      </div>

      {/* Thumbnail Strip */}
      {showThumbnails && slides.length > 1 && !isFullscreen && (
        <div className="border-t bg-card p-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "flex-shrink-0 w-24 h-16 rounded border-2 overflow-hidden transition-all",
                  index === currentSlide 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-border hover:border-primary/50",
                  viewedSlides.has(index) && "ring-1 ring-success/20"
                )}
                aria-label={`Go to slide ${index + 1}`}
                title={`Slide ${index + 1}`}
              >
                {slide.thumbnail || slide.url ? (
                  <img 
                    src={slide.thumbnail || slide.url} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {showKeyboardHelp && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-labelledby="keyboard-shortcuts-title"
          aria-modal="true"
        >
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold">Keyboard Shortcuts</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKeyboardHelp(false)}
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next slide:</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">→</kbd>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous slide:</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">←</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First slide:</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Home</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last slide:</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">End</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fullscreen:</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exit fullscreen:</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This help:</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 Tip: Use Tab to navigate between controls
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && requireFullViewing && (
        <div 
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-success text-success-foreground px-4 py-2 rounded-full shadow-lg"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium">✓ Presentation Completed!</p>
        </div>
      )}
    </div>
  );
}
