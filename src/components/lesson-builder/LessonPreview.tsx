import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SafeHtml from '@/components/ui/SafeHtml';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Pencil, Check, X } from 'lucide-react';
import { DiscussionComponent } from '@/components/lesson/DiscussionComponent';
import { LessonComponentRenderer } from '@/components/lesson/LessonComponentRenderer';

interface LessonComponent {
  component_type: string;
  content: any;
  order: number;
}

interface LessonPreviewProps {
  title: string;
  objectives: string[];
  components: LessonComponent[];
  lessonId?: string;
  onUpdateComponent?: (index: number, updates: Partial<LessonComponent>) => void;
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

export function LessonPreview({ title, objectives, components, lessonId, onUpdateComponent }: LessonPreviewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<any>({});

  const startEditing = (index: number, content: any) => {
    setEditingIndex(index);
    setEditContent({ ...content });
  };

  const saveEdit = (index: number) => {
    if (onUpdateComponent) {
      onUpdateComponent(index, { content: editContent });
    }
    setEditingIndex(null);
    setEditContent({});
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditContent({});
  };

  const renderEditFields = (component: LessonComponent, index: number) => {
    if (editingIndex !== index) return null;

    switch (component.component_type) {
      case 'page':
        return (
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={editContent.title || ''}
                onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Content</Label>
              <RichTextEditor
                value={editContent.body || ''}
                onChange={(value) => setEditContent({ ...editContent, body: value })}
              />
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={editContent.title || ''}
                onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Video URL</Label>
              <Input
                value={editContent.url || ''}
                onChange={(e) => setEditContent({ ...editContent, url: e.target.value })}
              />
            </div>
            <div>
              <Label>Caption</Label>
              <Input
                value={editContent.caption || ''}
                onChange={(e) => setEditContent({ ...editContent, caption: e.target.value })}
              />
            </div>
          </div>
        );

      case 'discussion':
        return (
          <div>
            <Label>Discussion Prompt</Label>
            <Textarea
              value={editContent.prompt || ''}
              onChange={(e) => setEditContent({ ...editContent, prompt: e.target.value })}
              rows={3}
            />
          </div>
        );

      case 'instructions':
        return (
          <div>
            <Label>Instructions</Label>
            <Textarea
              value={editContent.text || ''}
              onChange={(e) => setEditContent({ ...editContent, text: e.target.value })}
              rows={6}
            />
          </div>
        );

      case 'reflection':
        return (
          <div>
            <Label>Reflection Prompt</Label>
            <Textarea
              value={editContent.prompt || ''}
              onChange={(e) => setEditContent({ ...editContent, prompt: e.target.value })}
              rows={4}
            />
          </div>
        );

      case 'assignment':
        return (
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={editContent.title || ''}
                onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Points</Label>
              <Input
                type="number"
                value={editContent.points || ''}
                onChange={(e) => setEditContent({ ...editContent, points: e.target.value })}
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={editContent.dueDate || ''}
                onChange={(e) => setEditContent({ ...editContent, dueDate: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {componentTypeLabels[component.component_type] || component.component_type}
                </Badge>
                {component.content.title && (
                  <h3 className="font-semibold">{component.content.title}</h3>
                )}
              </div>
              {onUpdateComponent && (
                <div className="flex gap-2">
                  {editingIndex === index ? (
                    <>
                      <Button size="sm" onClick={() => saveEdit(index)}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEditing(index, component.content)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingIndex === index ? (
              renderEditFields(component, index)
            ) : (
              <>
                {component.component_type === 'page' && (
                  <SafeHtml html={component.content.body || ''} />
                )}
                {(component.component_type === 'video' || component.component_type === 'multimedia') && (
                  <LessonComponentRenderer 
                    component={component as any}
                    showTypeLabel={false}
                  />
                )}
                {component.component_type === 'discussion' && lessonId && (
                  <DiscussionComponent
                    componentId={component.content.id || `component-${index}`}
                    lessonId={lessonId}
                    lessonTitle={title}
                    lessonContent={objectives.join('. ')}
                    isTeacher={true}
                  />
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
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
