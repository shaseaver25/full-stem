import React from 'react';
import { Badge } from '@/components/ui/badge';
import InlineReadAloud from '@/components/InlineReadAloud';
import { LessonComponent } from '@/hooks/useLessonComponents';
import { FileText, Video, Code, MessageSquare, CheckSquare } from 'lucide-react';
import { DiscussionComponent } from './DiscussionComponent';
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
