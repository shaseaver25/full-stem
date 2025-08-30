import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SafeHtml from '@/components/ui/SafeHtml';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  Edit, 
  Save, 
  GripVertical, 
  Video, 
  FileText, 
  Users, 
  MessageSquare, 
  CheckSquare,
  Calculator
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface LessonComponent {
  type: string;
  content: any;
  order?: number;
}

interface ParsedLesson {
  title: string;
  gradeLevel?: string;
  description?: string;
  objectives?: string[];
  videos?: { url: string; title: string }[];
  instructions?: string;
  duration?: number;
  desmosEnabled?: boolean;
  desmosType?: 'calculator' | 'geometry';
  components: LessonComponent[];
}

interface LessonPreviewProps {
  lesson: ParsedLesson;
  onConfirm: (lesson: ParsedLesson) => void;
  onCancel: () => void;
}

const LessonPreview: React.FC<LessonPreviewProps> = ({ lesson: initialLesson, onConfirm, onCancel }) => {
  const [lesson, setLesson] = useState<ParsedLesson>(initialLesson);
  const [editingComponent, setEditingComponent] = useState<number | null>(null);

  const componentIcons = {
    video: Video,
    instructions: FileText,
    assignment: FileText,
    discussion: MessageSquare,
    reflection: Users,
    rubric: CheckSquare,
    resources: FileText,
    formativeCheck: CheckSquare,
    liveDemo: Calculator,
  };

  const componentLabels = {
    video: 'Video',
    instructions: 'Instructions',
    assignment: 'Assignment',
    discussion: 'Discussion',
    reflection: 'Reflection',
    rubric: 'Rubric',
    resources: 'Resources',
    formativeCheck: 'Formative Check',
    liveDemo: 'Live Demo',
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(lesson.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLesson({ ...lesson, components: items });
  };

  const updateComponent = (index: number, content: any) => {
    const updatedComponents = [...lesson.components];
    updatedComponents[index] = { ...updatedComponents[index], content };
    setLesson({ ...lesson, components: updatedComponents });
  };

  const renderComponentContent = (component: LessonComponent, index: number) => {
    const Icon = componentIcons[component.type as keyof typeof componentIcons] || FileText;
    const isEditing = editingComponent === index;

    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
              <Icon className="h-4 w-4" />
              <CardTitle className="text-sm">
                {componentLabels[component.type as keyof typeof componentLabels] || component.type}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingComponent(isEditing ? null : index)}
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {component.type === 'video' ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Video title"
                    value={component.content.title || ''}
                    onChange={(e) =>
                      updateComponent(index, { ...component.content, title: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Video URL"
                    value={component.content.url || ''}
                    onChange={(e) =>
                      updateComponent(index, { ...component.content, url: e.target.value })
                    }
                  />
                </div>
              ) : (
                <Textarea
                  value={component.content.html || component.content.text || ''}
                  onChange={(e) =>
                    updateComponent(index, { 
                      ...component.content, 
                      html: e.target.value,
                      text: e.target.value
                    })
                  }
                  rows={4}
                />
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {component.type === 'video' ? (
                <div>
                  <p className="font-medium">{component.content.title}</p>
                  <p className="text-sm text-gray-600">{component.content.url}</p>
                </div>
              ) : (
                <SafeHtml 
                  html={component.content.html || component.content.text || ''}
                  className="prose prose-sm max-w-none"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Lesson Preview & Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Lesson Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={lesson.title}
                onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Grade Level</Label>
              <Input
                value={lesson.gradeLevel || ''}
                onChange={(e) => setLesson({ ...lesson, gradeLevel: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={lesson.description || ''}
              onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Learning Objectives</Label>
            <Textarea
              value={lesson.objectives?.join('\n') || ''}
              onChange={(e) => setLesson({ 
                ...lesson, 
                objectives: e.target.value.split('\n').filter(obj => obj.trim())
              })}
              placeholder="One objective per line"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={lesson.duration || 60}
                onChange={(e) => setLesson({ ...lesson, duration: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="desmos-enabled"
                  checked={lesson.desmosEnabled || false}
                  onCheckedChange={(checked) => 
                    setLesson({ ...lesson, desmosEnabled: !!checked })
                  }
                />
                <Label htmlFor="desmos-enabled">Enable Desmos Tool</Label>
              </div>
              
              {lesson.desmosEnabled && (
                <Select
                  value={lesson.desmosType || 'calculator'}
                  onValueChange={(value: 'calculator' | 'geometry') => 
                    setLesson({ ...lesson, desmosType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calculator">Graphing Calculator</SelectItem>
                    <SelectItem value="geometry">Geometry Tool</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Components */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson Components</CardTitle>
          <p className="text-sm text-gray-600">
            Drag to reorder, click edit to modify content
          </p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="components">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {lesson.components.map((component, index) => (
                    <Draggable
                      key={`${component.type}-${index}`}
                      draggableId={`${component.type}-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {renderComponentContent(component, index)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {lesson.components.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No components found. Please check your lesson plan format.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(lesson)}>
          Confirm & Create Lesson
        </Button>
      </div>
    </div>
  );
};

export default LessonPreview;