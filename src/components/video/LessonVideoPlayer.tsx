import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Languages, Loader2 } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface Segment {
  start: number;
  end: number;
  text: string;
}

interface LessonVideoPlayerProps {
  componentId: string;
  videoUrl: string;
  title?: string;
  content: any;
}

export function LessonVideoPlayer({ componentId, videoUrl, title, content }: LessonVideoPlayerProps) {
  const { toast } = useToast();
  const { settings } = useAccessibility();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [transcript, setTranscript] = useState<any>(content?.transcript || null);
  const [translation, setTranslation] = useState<any>(null);
  const [currentSegment, setCurrentSegment] = useState<number>(-1);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  useEffect(() => {
    if (transcript && settings.translationEnabled && settings.preferredLanguage !== 'en') {
      loadTranslation(settings.preferredLanguage);
    } else {
      setTranslation(null);
    }
  }, [transcript, settings.translationEnabled, settings.preferredLanguage]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const segments = (translation?.segments || transcript?.segments || []) as Segment[];
      
      const index = segments.findIndex(
        seg => currentTime >= seg.start && currentTime <= seg.end
      );
      
      setCurrentSegment(index);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [transcript, translation]);

  const transcribeVideo = async () => {
    setIsTranscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-lesson-video', {
        body: { componentId },
      });

      if (error) throw error;

      // Reload component to get updated transcript
      const { data: updatedComponent } = await supabase
        .from('lesson_components')
        .select('content')
        .eq('id', componentId)
        .single();

      if (updatedComponent?.content && typeof updatedComponent.content === 'object' && 'transcript' in updatedComponent.content) {
        setTranscript((updatedComponent.content as any).transcript);
        toast({
          title: 'Transcription Complete',
          description: 'Video has been transcribed successfully',
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Failed',
        description: 'Could not transcribe video',
        variant: 'destructive',
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const loadTranslation = async (targetLanguage: string) => {
    if (!transcript) return;

    setIsLoadingTranslation(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text: transcript.text,
          segments: transcript.segments,
          targetLanguage,
        },
      });

      if (error) throw error;

      setTranslation(data);
      toast({
        title: 'Translation Complete',
        description: 'Captions have been translated',
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation Failed',
        description: 'Could not translate captions',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  const seekToSegment = (segment: Segment) => {
    if (videoRef.current) {
      videoRef.current.currentTime = segment.start;
      videoRef.current.play();
    }
  };

  const segments = (translation?.segments || transcript?.segments || []) as Segment[];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{title || 'Video'}</CardTitle>
            {!transcript && (
              <Button 
                onClick={transcribeVideo} 
                disabled={true}
                size="sm"
                variant="outline"
              >
                Speech-to-text in multiple languages coming soon
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full aspect-video"
              controls
            />
          </div>

          {transcript && (
            <div className="flex items-center gap-2">
              <LanguageSelector />
              {isLoadingTranslation && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Translating...
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {transcript && segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {translation ? 'Translated Transcript' : 'Transcript'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {segments.map((segment, index) => (
                  <button
                    key={index}
                    onClick={() => seekToSegment(segment)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentSegment
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground min-w-[60px]">
                        {Math.floor(segment.start / 60)}:{String(Math.floor(segment.start % 60)).padStart(2, '0')}
                      </span>
                      <p className="flex-1 text-sm">{segment.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
