import React from 'react';
import { Badge } from '@/components/ui/badge';
import InlineReadAloud from '@/components/InlineReadAloud';
import { LessonComponent } from '@/hooks/useLessonComponents';
import { FileText, Video, Code, MessageSquare, CheckSquare } from 'lucide-react';
import { DiscussionComponent } from './DiscussionComponent';
import { PresentationViewer } from './PresentationViewer';
import { DriveAttachmentsList } from '@/components/drive/DriveAttachmentsList';
import { OneDriveAttachmentsList } from '@/components/onedrive/OneDriveAttachmentsList';

interface LessonComponentRendererProps {
  component: LessonComponent;
  showTypeLabel?: boolean;
  lessonId?: string;
  lessonTitle?: string;
  lessonContent?: string;
  isTeacher?: boolean;
}

const componentTypeLabels: Record<string, string> = {
  slides: 'PowerPoint/Slides',
  page: 'Page',
  video: 'Multimedia',
  discussion: 'Discussion',
  codingEditor: 'Coding IDE',
  activity: 'Activity',
  assignment: 'Assignment',
  reflection: 'Reflection',
  instructions: 'Instructions',
  resources: 'Resources',
};

export function LessonComponentRenderer({ 
  component, 
  showTypeLabel = true,
  lessonId,
  lessonTitle,
  lessonContent,
  isTeacher = false
}: LessonComponentRendererProps) {
  const { content, component_type, read_aloud, language_code, id } = component;
  const textContent = content.body || content.text || content.prompt || '';

  // Render special discussion component with AI features
  if (component_type === 'discussion' && lessonId && lessonTitle) {
    return (
      <DiscussionComponent
        componentId={id}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        lessonContent={lessonContent}
        isTeacher={isTeacher}
      />
    );
  }

  // Render presentation viewer with enhanced features (shareable links only)
  if (component_type === 'slides') {
    // Extract URL from iframe tag if necessary
    let embedUrl = content.url;
    if (embedUrl && embedUrl.includes('<iframe')) {
      const srcMatch = embedUrl.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        embedUrl = srcMatch[1];
      }
    }
    
    return (
      <div className="space-y-4">
        {showTypeLabel && (
          <Badge variant="outline">
            {componentTypeLabels[component_type] || component_type}
          </Badge>
        )}
        <PresentationViewer
          title={content.title}
          embedUrl={embedUrl}
          slides={content.slides}
          speakerNotes={content.notes}
          allowDownloads={content.allowDownloads !== false}
          requireFullViewing={content.requireFullViewing || false}
          showThumbnails={content.showThumbnails !== false}
          enableTranslation={content.enableTranslation !== false}
        />
      </div>
    );
  }

  // Render video/multimedia component
  if (component_type === 'video' || component_type === 'multimedia') {
    let videoUrl = content.url;
    
    // Convert YouTube URLs to embed format
    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
      const youtubeIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (youtubeIdMatch && youtubeIdMatch[1]) {
        videoUrl = `https://www.youtube.com/embed/${youtubeIdMatch[1]}`;
      }
    }
    
    return (
      <div className="space-y-4">
        {showTypeLabel && (
          <Badge variant="outline" className="mb-3">
            <Video className="w-3 h-3 mr-1" />
            {componentTypeLabels[component_type] || component_type}
          </Badge>
        )}
        {content.title && <h3 className="text-lg font-semibold mb-3">{content.title}</h3>}
        {content.caption && (
          <p className="text-sm text-muted-foreground mb-3">{content.caption}</p>
        )}
        {videoUrl && (
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg bg-muted">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              title={content.title || 'Video content'}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}
        {read_aloud && textContent && (
          <div className="mt-4 pt-4 border-t">
            <InlineReadAloud text={textContent.replace(/<[^>]*>/g, '')} language={language_code || 'en'} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      {showTypeLabel && (
        <Badge variant="outline" className="mb-3">
          {componentTypeLabels[component_type] || component_type}
        </Badge>
      )}
      {content.title && <h3 className="text-lg font-semibold mb-3">{content.title}</h3>}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {content.body && <div dangerouslySetInnerHTML={{ __html: content.body }} />}
        {content.text && <p>{content.text}</p>}
        {content.prompt && <p className="italic">{content.prompt}</p>}
      </div>
      {read_aloud && textContent && (
        <div className="mt-4 pt-4 border-t">
          <InlineReadAloud text={textContent.replace(/<[^>]*>/g, '')} language={language_code || 'en'} />
        </div>
      )}
      {id && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <DriveAttachmentsList
            componentId={id}
            showEmbeds={true}
            canDelete={false}
          />
          <OneDriveAttachmentsList
            componentId={id}
            showEmbeds={true}
            canDelete={false}
          />
        </div>
      )}
    </div>
  );
}
