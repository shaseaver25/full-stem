import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GripVertical, Trash2 } from 'lucide-react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

interface LessonComponent {
  id?: string;
  component_type: string;
  title?: string;
  content: any;
  order: number;
  enabled: boolean;
  is_assignable: boolean;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
}

interface DraggableComponentCardProps {
  component: LessonComponent;
  index: number;
  onUpdate: (index: number, updates: Partial<LessonComponent>) => void;
  onDelete: (index: number) => void;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  isDragging: boolean;
}

export function DraggableComponentCard({
  component,
  index,
  onUpdate,
  onDelete,
  dragHandleProps,
  isDragging,
}: DraggableComponentCardProps) {
  return (
    <Card className={`transition-shadow ${isDragging ? 'shadow-lg' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">
            {component.component_type.replace('_', ' ').toUpperCase()}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(index)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`title-${index}`}>Title</Label>
          <Input
            id={`title-${index}`}
            value={component.title || ''}
            onChange={(e) => onUpdate(index, { title: e.target.value })}
            placeholder="Component title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`content-${index}`}>Content</Label>
          <Textarea
            id={`content-${index}`}
            value={typeof component.content === 'string' ? component.content : JSON.stringify(component.content)}
            onChange={(e) => onUpdate(index, { content: e.target.value })}
            placeholder="Component content"
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`enabled-${index}`}
            checked={component.enabled}
            onCheckedChange={(checked) => onUpdate(index, { enabled: checked })}
          />
          <Label htmlFor={`enabled-${index}`}>Enabled</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`assignable-${index}`}
            checked={component.is_assignable}
            onCheckedChange={(checked) => onUpdate(index, { is_assignable: checked })}
          />
          <Label htmlFor={`assignable-${index}`}>Assignable</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`read-aloud-${index}`}
            checked={component.read_aloud}
            onCheckedChange={(checked) => onUpdate(index, { read_aloud: checked })}
          />
          <Label htmlFor={`read-aloud-${index}`}>Read Aloud</Label>
        </div>
      </CardContent>
    </Card>
  );
}
