import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LessonComponent } from '@/hooks/useLessonComponents';
import VideoSection from './VideoSection';

interface LessonComponentRendererProps {
  component: LessonComponent;
}

const LessonComponentRenderer: React.FC<LessonComponentRendererProps> = ({ component }) => {
  const { component_type, content } = component;

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
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.html || content.text || '' }} />
          </div>
        );

      case 'assignment':
        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <h3>{content.title || 'Assignment'}</h3>
              <p>{content.instructions || content.description || ''}</p>
            </div>
            {content.dueDate && (
              <Badge variant="outline">Due: {content.dueDate}</Badge>
            )}
            <Button className="w-full sm:w-auto">
              Start Assignment
            </Button>
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
    <div className="min-h-[200px]">
      {renderContent()}
    </div>
  );
};

export default LessonComponentRenderer;