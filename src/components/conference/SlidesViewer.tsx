import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import SpeechControls from '@/components/SpeechControls';
import { useElevenLabsTTSPublic } from '@/hooks/useElevenLabsTTSPublic';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';

interface SlidesViewerProps {
  sessionTitle: string;
  slideCount?: number;
  targetLanguage?: string;
}

const SlidesViewer: React.FC<SlidesViewerProps> = ({ sessionTitle, slideCount = 10, targetLanguage = 'en' }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  const { translateText, isTranslating } = useLiveTranslation();
  const { speak, pause, resume, stop, isPlaying, isPaused, isLoading, error, currentTime, duration } = useElevenLabsTTSPublic(targetLanguage);

  const slideContent = `Slide content for "${sessionTitle}" would be displayed here`;

  useEffect(() => {
    const translateSlideContent = async () => {
      if (targetLanguage !== 'en') {
        const translated = await translateText({ text: slideContent, targetLanguage });
        setTranslatedContent(translated);
      } else {
        setTranslatedContent(null);
      }
    };
    translateSlideContent();
  }, [currentSlide, targetLanguage]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(1, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(slideCount, prev + 1));
  };

  const handleReadAloud = () => {
    const textToRead = translatedContent || slideContent;
    speak(textToRead);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">Presentation Slides</CardTitle>
          <div className="flex items-center gap-2">
            <SpeechControls
              isPlaying={isPlaying}
              isPaused={isPaused}
              isLoading={isLoading}
              error={error}
              currentTime={currentTime}
              duration={duration}
              onPlay={handleReadAloud}
              onPause={pause}
              onResume={resume}
              onStop={stop}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slide Display Area */}
        <div className="relative bg-muted rounded-lg aspect-video flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="text-center space-y-4 p-8">
              <div className="text-6xl font-bold text-primary/20">
                {currentSlide}
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {isTranslating ? 'Translating...' : (translatedContent || slideContent)}
              </p>
            </div>
          </div>
        </div>

        {/* Slide Navigation Controls */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevSlide}
            disabled={currentSlide === 1}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Slide {currentSlide} of {slideCount}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextSlide}
            disabled={currentSlide === slideCount}
            aria-label="Next slide"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Slide Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: slideCount }, (_, i) => i + 1).map((slideNum) => (
            <button
              key={slideNum}
              onClick={() => setCurrentSlide(slideNum)}
              className={`flex-shrink-0 w-16 h-12 rounded border-2 transition-all ${
                currentSlide === slideNum
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted hover:border-primary/50'
              }`}
              aria-label={`Go to slide ${slideNum}`}
            >
              <div className="flex items-center justify-center h-full text-xs font-medium">
                {slideNum}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SlidesViewer;
