import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Volume2, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';

export type Flashcard = {
  id: string;
  frontText: string;
  backText: string;
  imageUrl?: string | null;
  language?: string;
  readingLevel?: '3' | '5' | '8';
};

type FlashcardLessonProps = {
  cards: Flashcard[];
  mode?: 'study' | 'quiz';
  title?: string;
  description?: string;
  ttsEnabled?: boolean;
  onComplete?: () => void;
};

export function FlashcardLesson({
  cards,
  mode = 'study',
  title = 'Flashcards',
  description,
  ttsEnabled: propTtsEnabled,
  onComplete
}: FlashcardLessonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [reviewCards, setReviewCards] = useState<Set<string>>(new Set());
  const [visitedCards, setVisitedCards] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const { settings } = useAccessibility();
  const { speak, isPlaying, isLoading } = useTextToSpeech();

  const ttsEnabled = propTtsEnabled ?? settings.ttsEnabled;
  const currentCard = cards[currentIndex];
  const progress = (visitedCards.size / cards.length) * 100;

  // Mark card as visited when index changes
  useEffect(() => {
    setVisitedCards(prev => new Set([...prev, currentIndex]));
  }, [currentIndex]);

  // Reset flip state when changing cards
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showResults) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isFlipped, showResults]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (mode === 'quiz' && visitedCards.size === cards.length) {
      setShowResults(true);
      onComplete?.();
    }
  }, [currentIndex, cards.length, mode, visitedCards.size, onComplete]);

  const handleKnown = useCallback(() => {
    setKnownCards(prev => new Set([...prev, currentCard.id]));
    setReviewCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id);
      return newSet;
    });
    handleNext();
  }, [currentCard, handleNext]);

  const handleReview = useCallback(() => {
    setReviewCards(prev => new Set([...prev, currentCard.id]));
    setKnownCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id);
      return newSet;
    });
    handleNext();
  }, [currentCard, handleNext]);

  const handleSpeak = useCallback((text: string) => {
    if (ttsEnabled && !isPlaying) {
      speak(text);
    }
  }, [ttsEnabled, isPlaying, speak]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setReviewCards(new Set());
    setVisitedCards(new Set());
    setShowResults(false);
  }, []);

  if (!currentCard) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No flashcards available.
        </CardContent>
      </Card>
    );
  }

  // Results view for quiz mode
  if (showResults) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quiz Complete! 🎉</CardTitle>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {knownCards.size}/{cards.length}
            </Badge>
          </div>
          <CardDescription>
            You marked {knownCards.size} cards as known
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Known</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {knownCards.size}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-2">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Review</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {reviewCards.size}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleReset} className="flex-1">
              <RotateCw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle>{title}</CardTitle>
            <Badge variant="outline">
              {mode === 'study' ? 'Study Mode' : 'Quiz Mode'}
            </Badge>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Card {currentIndex + 1} of {cards.length}
              </span>
              <span className="font-medium text-primary">
                {Math.round(progress)}% viewed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Flashcard */}
      <div className="perspective-1000">
        <Card
          className={cn(
            "relative min-h-[400px] cursor-pointer transition-transform duration-500 transform-style-3d",
            isFlipped && "rotate-y-180",
            settings.highContrast && "border-2"
          )}
          onClick={handleFlip}
          role="button"
          aria-label={`Flashcard ${currentIndex + 1}. Click or press space to flip. ${isFlipped ? 'Showing back' : 'Showing front'}`}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFlip();
            }
          }}
        >
          {/* Front of card */}
          <div
            className={cn(
              "absolute inset-0 backface-hidden",
              isFlipped && "invisible"
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Front</Badge>
                {ttsEnabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentCard.frontText);
                    }}
                    disabled={isLoading || isPlaying}
                    aria-label="Read front of card aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
              {currentCard.imageUrl && (
                <img
                  src={currentCard.imageUrl}
                  alt=""
                  className="max-w-full max-h-48 object-contain mb-4 rounded-lg"
                />
              )}
              <p className="text-2xl font-semibold leading-relaxed">
                {currentCard.frontText}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Click or press space to flip</span>
              </div>
            </CardContent>
          </div>

          {/* Back of card */}
          <div
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180",
              !isFlipped && "invisible"
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Back</Badge>
                {ttsEnabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentCard.backText);
                    }}
                    disabled={isLoading || isPlaying}
                    aria-label="Read back of card aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <p className="text-2xl font-semibold leading-relaxed">
                {currentCard.backText}
              </p>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Navigation and Actions */}
      <Card>
        <CardContent className="pt-6">
          {mode === 'study' ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                aria-label="Previous card"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleFlip}
                aria-label="Flip card"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Flip Card
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1}
                aria-label="Next card"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {!isFlipped && (
                <div className="text-center text-sm text-muted-foreground pb-2">
                  Flip the card to see the answer, then mark if you knew it
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="w-24"
                  aria-label="Previous card"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReview}
                    disabled={!isFlipped}
                    className="flex items-center justify-center gap-2 border-orange-200 dark:border-orange-800"
                    aria-label="Mark card for review"
                  >
                    <XCircle className="w-4 h-4 text-orange-600" />
                    Need Review
                  </Button>
                  <Button
                    onClick={handleKnown}
                    disabled={!isFlipped}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    aria-label="Mark card as known"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    I Know This
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIndex === cards.length - 1 && !isFlipped}
                  className="w-24"
                  aria-label={currentIndex === cards.length - 1 ? 'Finish quiz' : 'Next card'}
                >
                  {currentIndex === cards.length - 1 ? 'Finish' : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* Status indicators */}
              {(knownCards.has(currentCard.id) || reviewCards.has(currentCard.id)) && (
                <div className="flex items-center justify-center gap-2 text-sm pt-2">
                  {knownCards.has(currentCard.id) && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Marked as Known
                    </Badge>
                  )}
                  {reviewCards.has(currentCard.id) && (
                    <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-950">
                      <XCircle className="w-3 h-3 mr-1" />
                      Needs Review
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
