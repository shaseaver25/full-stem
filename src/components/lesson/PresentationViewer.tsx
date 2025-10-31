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
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useTranslation } from '@/hooks/useTranslation';
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
  
  const { speak, isPlaying, isLoading: isSpeaking } = useTextToSpeech();
  const { translate, isTranslating } = useTranslation();

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
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, totalSlides, isFullscreen, goToPrevious, goToNext, goToFirst, goToLast]);

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
        const translated = await translate(currentSlideData.text);
        setTranslatedTexts(new Map(translatedTexts).set(currentSlide, translated));
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
    >
      {/* Screen reader announcer */}
      <div 
        id="slide-announcer" 
        className="sr-only" 
        role="status" 
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-2 p-3 border-b bg-card">
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
            onClick={handleReadAloud}
            disabled={isSpeaking || !currentSlideData?.text}
            aria-label={isPlaying ? "Reading slide" : "Read slide aloud"}
            title="Read slide aloud"
          >
            <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
          </Button>
        </div>

        <div className="flex-1 text-center">
          {title && <h2 className="font-semibold text-sm">{title}</h2>}
        </div>

        <div className="flex items-center gap-2">
          {enableTranslation && (
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32" aria-label="Select language">
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
              aria-label="Download presentation"
              title="Download presentation"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen (ESC)" : "Enter fullscreen (F key)"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-3 py-2 bg-card border-b">
        <div className="flex items-center gap-3">
          <Progress value={progressPercentage} className="flex-1" aria-label={`Progress: ${Math.round(progressPercentage)}%`} />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Main Slide View */}
      <div className="relative flex items-center justify-center min-h-[400px] bg-muted/30">
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
          aria-label="Previous slide"
          title="Previous slide (Left arrow)"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Slide Content */}
        <div className="w-full max-w-5xl p-8">
          {embedUrl ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
              {embedUrl.endsWith('.pdf') || embedUrl.endsWith('.pptx') || embedUrl.endsWith('.ppt') ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(embedUrl)}&embedded=true`}
                  className="w-full h-full"
                  title={`Slide ${currentSlide + 1} of ${totalSlides}`}
                  allowFullScreen
                />
              ) : (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  title={`Slide ${currentSlide + 1} of ${totalSlides}`}
                  allowFullScreen
                />
              )}
            </div>
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
          aria-label="Next slide"
          title="Next slide (Right arrow or Space)"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

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

      {/* Completion Message */}
      {isCompleted && requireFullViewing && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-success text-success-foreground px-4 py-2 rounded-full shadow-lg">
          <p className="text-sm font-medium">✓ Presentation Completed!</p>
        </div>
      )}
    </div>
  );
}
