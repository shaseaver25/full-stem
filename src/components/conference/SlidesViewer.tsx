import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface SlidesViewerProps {
  sessionTitle: string;
  slideCount?: number;
}

const SlidesViewer: React.FC<SlidesViewerProps> = ({ sessionTitle, slideCount = 10 }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(1, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(slideCount, prev + 1));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Presentation Slides</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
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
                Slide content for "{sessionTitle}" would be displayed here
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
