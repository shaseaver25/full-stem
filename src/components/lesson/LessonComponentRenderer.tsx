import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LessonComponent } from '@/hooks/useLessonComponents';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import VideoSection from './VideoSection';
import CodeIDE from './CodeIDE';
import AssignmentSection from '@/components/assignments/AssignmentSection';
import InlineReadAloud from '@/components/InlineReadAloud';
import SafeHtml from '@/components/ui/SafeHtml';
import { DriveAttachmentsList } from '@/components/drive/DriveAttachmentsList';
import { Separator } from '@/components/ui/separator';

interface LessonComponentRendererProps {
  component: LessonComponent;
}

const LessonComponentRenderer: React.FC<LessonComponentRendererProps> = ({ component }) => {
  const { component_type, content } = component;
  const { preferences } = useUserPreferences();
  
  // Get the user's reading level, default to Grade 5
  const userReadingLevel = preferences?.['Reading Level'] || 'Grade 5';

  const renderContent = () => {
    switch (component_type) {
      case 'video':
        return (
          <VideoSection 
            videoUrl={content.url || content.videoUrl || ''} 
            title={content.title || 'Lesson Video'} 
          />
        );

      case 'instructions':
        const instructionText = content.content || content.html || content.text || '';
        return (
          <div className="space-y-4">
            <InlineReadAloud text={instructionText} />
          </div>
        );

      case 'assignment':
        console.log('Rendering assignment component:', content);
        return (
          <div className="space-y-4">
            <SafeHtml 
              html={content.content || content.instructions || content.description || ''}
              className="max-w-none"
            />
            {content.dueDate && (
              <Badge variant="outline">Due: {content.dueDate}</Badge>
            )}
            <div className="mt-6">
              <AssignmentSection lessonId={component.lesson_id?.toString() || ''} />
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <h3>{content.title || 'Activity'}</h3>
              <p>{content.description || ''}</p>
            </div>
            {content.estimatedTime && (
              <Badge variant="secondary">⏱️ {content.estimatedTime} minutes</Badge>
            )}
            <Button className="w-full sm:w-auto">
              Begin Activity
            </Button>
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            {content.links && Array.isArray(content.links) ? (
              <div className="grid gap-3">
                {content.links.map((link: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{link.title || link.name}</h4>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No resources available</p>
            )}
          </div>
        );

      case 'discussion':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Discussion</h3>
            <div className="prose max-w-none">
              <p>{content.prompt || content.question || ''}</p>
            </div>
            <Alert>
              <AlertDescription>
                Discussion forum integration coming soon. For now, discuss with your classmates offline.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'reflection':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reflection</h3>
            <div className="prose max-w-none">
              <p>{content.prompt || content.question || ''}</p>
            </div>
            <textarea 
              placeholder="Write your reflection here..."
              className="w-full h-32 p-3 border rounded-md resize-none"
            />
            <Button className="w-full sm:w-auto">
              Save Reflection
            </Button>
          </div>
        );

      case 'formativeCheck':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Check</h3>
            <div className="prose max-w-none">
              <p>{content.question || ''}</p>
            </div>
            {content.options && Array.isArray(content.options) ? (
              <div className="space-y-2">
                {content.options.map((option: string, index: number) => (
                  <Button key={index} variant="outline" className="w-full justify-start">
                    {String.fromCharCode(65 + index)}. {option}
                  </Button>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Interactive questions coming soon.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Checklist</h3>
            {content.items && Array.isArray(content.items) ? (
              <div className="space-y-2">
                {content.items.map((item: string, index: number) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No checklist items defined</p>
            )}
          </div>
        );

      case 'codingEditor':
        return <CodeIDE content={content} />;

      case 'slides':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Slides</h3>
            {content.embedUrl ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden border">
                <iframe
                  src={content.embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={content.title || 'Presentation Slides'}
                />
              </div>
            ) : content.slides && Array.isArray(content.slides) ? (
              <div className="space-y-4">
                {content.slides.map((slide: any, index: number) => (
                  <Card key={index} className="p-6">
                    <h4 className="text-base font-semibold mb-2">Slide {index + 1}</h4>
                    <SafeHtml html={slide.content || slide.html || ''} className="max-w-none" />
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No slide content available. Please add an embed URL or slide content.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return (
          <Alert>
            <AlertDescription>
              Component type "{component_type}" is not yet implemented.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="min-h-[200px] space-y-4">
      {renderContent()}
      
      {component.id && (
        <>
          <Separator />
          <DriveAttachmentsList 
            componentId={component.id} 
            showEmbeds={true}
            canDelete={false}
          />
        </>
      )}
    </div>
  );
};

export default LessonComponentRenderer;