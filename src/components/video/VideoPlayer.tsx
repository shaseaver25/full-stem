import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Languages, Loader2, Play, Pause } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface Segment {
  start: number;
  end: number;
  text: string;
}

interface VideoPlayerProps {
  videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const { toast } = useToast();
  const { settings } = useAccessibility();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [video, setVideo] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [translation, setTranslation] = useState<any>(null);
  const [currentSegment, setCurrentSegment] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  // Load video data
  useEffect(() => {
    loadVideoData();
  }, [videoId]);

  // Load translation when language changes
  useEffect(() => {
    if (transcript && settings.translationEnabled && settings.preferredLanguage !== 'en') {
      loadTranslation(settings.preferredLanguage);
    } else {
      setTranslation(null);
    }
  }, [transcript, settings.translationEnabled, settings.preferredLanguage]);

  // Update current segment based on video time
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

  const loadVideoData = async () => {
    try {
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (videoError) throw videoError;
      setVideo(videoData);

      // Load transcript
      const { data: transcriptData, error: transcriptError } = await supabase
        .from('video_transcripts')
        .select('*')
        .eq('video_id', videoId)
        .eq('language', 'en')
        .single();

      if (transcriptError && transcriptError.code !== 'PGRST116') {
        console.error('Error loading transcript:', transcriptError);
      } else if (transcriptData) {
        setTranscript(transcriptData);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      toast({
        title: 'Error',
        description: 'Failed to load video',
        variant: 'destructive',
      });
    }
  };

  const loadTranslation = async (targetLanguage: string) => {
    if (!transcript) return;

    setIsLoadingTranslation(true);

    try {
      // Check if translation exists
      const { data: existingTranslation, error: fetchError } = await supabase
        .from('video_translations')
        .select('*')
        .eq('transcript_id', transcript.id)
        .eq('language', targetLanguage)
        .single();

      if (existingTranslation) {
        setTranslation(existingTranslation);
        return;
      }

      // Generate translation
      const { data, error } = await supabase.functions.invoke('translate-transcript', {
        body: {
          transcriptId: transcript.id,
          targetLanguage,
        },
      });

      if (error) throw error;

      // Reload translation
      const { data: newTranslation } = await supabase
        .from('video_translations')
        .select('*')
        .eq('transcript_id', transcript.id)
        .eq('language', targetLanguage)
        .single();

      if (newTranslation) {
        setTranslation(newTranslation);
        toast({
          title: 'Translation Complete',
          description: 'Captions have been translated',
        });
      }
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

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!video) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const videoUrl = `https://irxzpsvzlihqitlicoql.supabase.co/storage/v1/object/public/lesson-videos/${video.file_url}`;
  const segments = (translation?.segments || transcript?.segments || []) as Segment[];
  const displayText = translation?.content || transcript?.content || '';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{video.title}</CardTitle>
              {video.description && (
                <p className="text-sm text-muted-foreground mt-2">{video.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {video.transcription_status === 'processing' && (
                <Badge variant="secondary">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Transcribing...
                </Badge>
              )}
              {video.transcription_status === 'completed' && (
                <Badge variant="default">Transcribed</Badge>
              )}
              {video.transcription_status === 'failed' && (
                <Badge variant="destructive">Transcription Failed</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full aspect-video"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
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

      {transcript && (
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
