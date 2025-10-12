import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Video, Trash2, Upload, FileText, Activity, MessageSquare, CheckSquare, Code, Users, BookOpen } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Lesson, Video as VideoType } from '@/types/buildClassTypes';
import LessonPlanUploader from './LessonPlanUploader';
import LessonPreview from './LessonPreview';
import { useToast } from '@/hooks/use-toast';

interface LessonComponent {
  id: string;
  type: string;
  content: any;
  order: number;
}

interface LessonsFormProps {
  lessons: Lesson[];
  currentLesson: Partial<Lesson> & { components?: LessonComponent[] };
  setCurrentLesson: React.Dispatch<React.SetStateAction<Partial<Lesson> & { components?: LessonComponent[] }>>;
  addLesson: () => void;
  removeLesson: (id: string) => void;
  addVideoToLesson: () => void;
  removeVideoFromLesson: (videoId: string) => void;
  updateLessonVideo: (videoId: string, field: 'url' | 'title', value: string) => void;
}

const LessonsForm: React.FC<LessonsFormProps> = ({
  lessons,
  currentLesson,
  setCurrentLesson,
  addLesson,
  removeLesson,
  addVideoToLesson,
  removeVideoFromLesson,
  updateLessonVideo
}) => {
  const { toast } = useToast();
  const [parsedLesson, setParsedLesson] = useState<any>(null);
  const [newComponent, setNewComponent] = useState({
    type: '',
    content: '',
    order: 0,
  });

  const componentTypes = [
    { value: 'video', label: '🎥 Video', icon: Video },
    { value: 'instructions', label: '📋 Instructions', icon: FileText },
    { value: 'assignment', label: '📝 Assignment', icon: FileText },
    { value: 'activity', label: '🎯 Activity', icon: Activity },
    { value: 'resources', label: '📚 Resources', icon: BookOpen },
    { value: 'discussion', label: '💬 Discussion', icon: MessageSquare },
    { value: 'reflection', label: '🤔 Reflection', icon: MessageSquare },
    { value: 'formativeCheck', label: '✅ Quick Check', icon: CheckSquare },
    { value: 'rubric', label: '📊 Rubric', icon: FileText },
    { value: 'checklist', label: '☑️ Checklist', icon: CheckSquare },
    { value: 'codingEditor', label: '💻 Code Editor', icon: Code },
    { value: 'peerReview', label: '👥 Peer Review', icon: Users },
  ];

  const addComponentToLesson = () => {
    console.log('Adding component:', { type: newComponent.type, content: newComponent.content });
    
    if (!newComponent.type || !newComponent.content.trim()) {
      console.error('Missing component data:', { type: newComponent.type, content: newComponent.content });
      toast({
        title: 'Missing Information',
        description: 'Please select a component type and enter content',
        variant: 'destructive',
      });
      return;
    }

    const component: LessonComponent = {
      id: `${Date.now()}-${Math.random()}`,
      type: newComponent.type,
      content: parseComponentContent(newComponent.type, newComponent.content),
      order: currentLesson.components?.length || 0,
    };

    console.log('Created component:', component);

    setCurrentLesson(prevLesson => {
      const updatedLesson = {
        ...prevLesson,
        components: [...(prevLesson.components || []), component],
      };
      console.log('Updated lesson with component:', updatedLesson);
      return updatedLesson;
    });

    setNewComponent({ type: '', content: '', order: 0 });
    
    toast({
      title: 'Component Added',
      description: `${newComponent.type} component added to lesson`,
    });
  };

  const removeComponentFromLesson = (componentId: string) => {
    setCurrentLesson({
      ...currentLesson,
      components: currentLesson.components?.filter(c => c.id !== componentId) || [],
    });
  };

  const parseComponentContent = (type: string, content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      // Handle different component types with simple text content
      switch (type) {
        case 'video':
          return { url: content, title: 'Video' };
        case 'instructions':
        case 'assignment':
        case 'activity':
        case 'discussion':
        case 'reflection':
          return { html: content };
        case 'resources':
          return { links: content.split('\n').filter(link => link.trim()) };
        case 'formativeCheck':
          return { questions: content.split('\n').filter(q => q.trim()) };
        default:
          return { text: content };
      }
    }
  };

  const getContentPlaceholder = (type: string) => {
    switch (type) {
      case 'video':
        return 'Enter video URL or JSON: {"url": "https://youtube.com/watch?v=...", "title": "Video Title"}';
      case 'instructions':
        return 'Enter lesson instructions...';
      case 'assignment':
        return 'Enter assignment description and requirements...';
      case 'activity':
        return 'Describe the learning activity...';
      case 'resources':
        return 'Enter resource links (one per line) or JSON: {"links": ["url1", "url2"]}';
      case 'discussion':
        return 'Enter discussion prompt or questions...';
      case 'reflection':
        return 'Enter reflection questions...';
      case 'formativeCheck':
        return 'Enter quiz questions (one per line) or JSON format...';
      case 'rubric':
        return 'Enter rubric criteria or JSON format...';
      case 'checklist':
        return 'Enter checklist items (one per line)...';
      case 'codingEditor':
        return 'Enter coding exercise description or starter code...';
      case 'peerReview':
        return 'Enter peer review instructions...';
      default:
        return 'Enter content...';
    }
  };

  const handleLessonParsed = (lesson: any) => {
    setParsedLesson(lesson);
  };

  const handleConfirmParsedLesson = (lesson: any) => {
    // Convert parsed lesson to our lesson format
    const newLesson: Partial<Lesson> & { components?: LessonComponent[] } = {
      title: lesson.title,
      description: lesson.description,
      objectives: lesson.objectives,
      videos: lesson.videos || [],
      instructions: lesson.instructions,
      duration: lesson.duration,
      desmosEnabled: lesson.desmosEnabled,
      desmosType: lesson.desmosType,
      materials: lesson.components
        .filter((c: any) => c.type === 'resources')
        .map((c: any) => c.content.text || c.content.html || '')
        .filter((text: string) => text.trim()),
      components: lesson.components || [],
    };

    setCurrentLesson(newLesson);
    setParsedLesson(null);
  };

  const handleCancelParsed = () => {
    setParsedLesson(null);
  };

  if (parsedLesson) {
    return (
      <LessonPreview
        lesson={parsedLesson}
        onConfirm={handleConfirmParsedLesson}
        onCancel={handleCancelParsed}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Lesson Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Build Your Lesson
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
                {/* Basic Lesson Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lesson Title</Label>
                    <Input
                      value={currentLesson.title || ''}
                      onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                      placeholder="Enter lesson title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={currentLesson.duration || 60}
                      onChange={(e) => setCurrentLesson({...currentLesson, duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={currentLesson.description || ''}
                    onChange={(e) => setCurrentLesson({...currentLesson, description: e.target.value})}
                    placeholder="Lesson overview and description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Learning Objectives</Label>
                  <Textarea
                    value={currentLesson.objectives?.join('\n') || ''}
                    onChange={(e) => setCurrentLesson({...currentLesson, objectives: e.target.value.split('\n')})}
                    placeholder="One objective per line"
                    rows={3}
                  />
                </div>

                {/* Desmos Configuration */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="desmos-enabled"
                      checked={currentLesson.desmosEnabled || false}
                      onCheckedChange={(checked) => 
                        setCurrentLesson({...currentLesson, desmosEnabled: !!checked})
                      }
                    />
                    <Label htmlFor="desmos-enabled" className="text-sm font-medium">
                      Enable Desmos Tool for Students
                    </Label>
                  </div>
                  
                  {currentLesson.desmosEnabled && (
                    <div className="space-y-2">
                      <Label>Select Tool Type</Label>
                      <Select
                        value={currentLesson.desmosType || 'calculator'}
                        onValueChange={(value: 'calculator' | 'geometry') => 
                          setCurrentLesson({...currentLesson, desmosType: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Desmos tool type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calculator">Graphing Calculator</SelectItem>
                          <SelectItem value="geometry">Geometry Tool</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Lesson Components Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Lesson Components</Label>
                    <Badge variant="secondary">{currentLesson.components?.length || 0} components</Badge>
                  </div>

                  {/* Add Component Form */}
                  <Card className="border-dashed">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Learning Component
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Component Type</Label>
                          <Select
                            value={newComponent.type}
                            onValueChange={(value) => setNewComponent({...newComponent, type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select component type" />
                            </SelectTrigger>
                            <SelectContent>
                              {componentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {newComponent.type && (
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            value={newComponent.content}
                            onChange={(e) => setNewComponent({...newComponent, content: e.target.value})}
                            placeholder={getContentPlaceholder(newComponent.type)}
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground">
                            You can enter plain text or JSON format for structured content.
                          </p>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={addComponentToLesson}
                        disabled={!newComponent.type || !newComponent.content.trim()}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Component
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing Components */}
                  {currentLesson.components && currentLesson.components.length > 0 && (
                    <div className="space-y-3">
                      {currentLesson.components.map((component, index) => {
                        const componentType = componentTypes.find(t => t.value === component.type);
                        const Icon = componentType?.icon || FileText;
                        
                        return (
                          <div key={component.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <Badge variant="outline">{componentType?.label || component.type}</Badge>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {typeof component.content === 'string' 
                                      ? component.content.substring(0, 100) + '...'
                                      : JSON.stringify(component.content).substring(0, 100) + '...'
                                    }
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeComponentFromLesson(component.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button onClick={addLesson} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lesson
                </Button>
              </CardContent>
            </Card>

            {/* Created Lessons List */}
            <Card>
              <CardHeader>
                <CardTitle>Created Lessons ({lessons.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{lesson.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          {lesson.duration}min
                        </span>
                        {(lesson as any).components && (
                          <span>{(lesson as any).components.length} component(s)</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {lessons.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No lessons created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
    </div>
  );
};

export default LessonsForm;
