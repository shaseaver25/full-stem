import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SafeHtml from '@/components/ui/SafeHtml';
import { Badge } from '@/components/ui/badge';

interface LessonComponent {
  component_type: string;
  content: any;
  order: number;
}

interface LessonPreviewProps {
  title: string;
  objectives: string[];
  components: LessonComponent[];
}

const componentTypeLabels: Record<string, string> = {
  slides: 'Slides',
  page: 'Page',
  video: 'Video',
  discussion: 'Discussion',
  codingEditor: 'Coding',
  activity: 'Activity',
  assignment: 'Assignment',
  reflection: 'Reflection',
  instructions: 'Instructions',
  resources: 'Resources',
};

export function LessonPreview({ title, objectives, components }: LessonPreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{title || 'Untitled Lesson'}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Learning Objectives:</h3>
          <ul className="list-disc list-inside space-y-1">
            {objectives.filter(obj => obj.trim()).map((objective, index) => (
              <li key={index} className="text-muted-foreground">{objective}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {components.map((component, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {componentTypeLabels[component.component_type] || component.component_type}
              </Badge>
              {component.content.title && (
                <h3 className="font-semibold">{component.content.title}</h3>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {component.component_type === 'page' && (
              <SafeHtml html={component.content.body || ''} />
            )}
            {component.component_type === 'video' && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">{component.content.caption}</p>
                <div className="aspect-video bg-muted rounded flex items-center justify-center">
                  {component.content.url ? (
                    <iframe
                      src={component.content.url}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  ) : (
                    <p className="text-muted-foreground">Video URL not set</p>
                  )}
                </div>
              </div>
            )}
            {component.component_type === 'discussion' && (
              <div className="bg-accent/50 p-4 rounded">
                <p className="font-medium mb-2">Discussion Prompt:</p>
                <p>{component.content.prompt}</p>
              </div>
            )}
            {component.component_type === 'instructions' && (
              <SafeHtml html={component.content.text || ''} />
            )}
            {component.component_type === 'reflection' && (
              <div className="bg-accent/50 p-4 rounded">
                <p className="font-medium mb-2">Reflect on:</p>
                <p>{component.content.prompt}</p>
              </div>
            )}
            {component.component_type === 'assignment' && (
              <div className="space-y-2">
                <p><strong>Points:</strong> {component.content.points || 'N/A'}</p>
                <p><strong>Due:</strong> {component.content.dueDate || 'N/A'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
