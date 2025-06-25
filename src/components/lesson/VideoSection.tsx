
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoSectionProps {
  videoUrl: string;
  title?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl, title }) => {
  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-red-600" />
          {title || 'Lesson Video'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AspectRatio ratio={16 / 9}>
          <iframe
            src={embedUrl}
            title={title || 'Lesson Video'}
            className="w-full h-full rounded-b-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </AspectRatio>
      </CardContent>
    </Card>
  );
};

export default VideoSection;
