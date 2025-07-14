import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Save, X, BookOpen, Video, FileText, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Course {
  track: string;
  lessons: any[];
}

interface LessonComponent {
  id?: string;
  component_type: string;
  content: any;
  order: number;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
  enabled: boolean;
}

const CourseEditor = () => {
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [editingLesson, setEditingLesson] = useState<number | null>(null);
  const [newComponent, setNewComponent] = useState<Partial<LessonComponent>>({
    component_type: '',
    content: '',
    order: 0,
    language_code: 'en',
    read_aloud: true,
    enabled: true,
  });
  const queryClient = useQueryClient();

  // Fetch available tracks/courses
  const { data: tracks } = useQuery({
    queryKey: ['course-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Lessons')
        .select('Track')
        .not('Track', 'is', null);
      
      if (error) throw error;
      
      const uniqueTracks = [...new Set(data.map(item => item.Track))].filter(Boolean);
      return uniqueTracks as string[];
    },
  });

  // Fetch lessons for selected track
  const { data: lessons } = useQuery({
    queryKey: ['course-lessons', selectedTrack],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Lessons')
        .select('*')
        .eq('Track', selectedTrack)
        .order('Order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTrack,
  });

  // Fetch lesson components for a specific lesson
  const { data: lessonComponents } = useQuery({
    queryKey: ['lesson-components', editingLesson],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_components')
        .select('*')
        .eq('lesson_id', editingLesson)
        .order('order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!editingLesson,
  });

  // Create lesson component mutation
  const createComponentMutation = useMutation({
    mutationFn: async (component: Omit<LessonComponent, 'id'>) => {
      const { data, error } = await supabase
        .from('lesson_components')
        .insert({
          ...component,
          lesson_id: editingLesson,
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-components', editingLesson] });
      setNewComponent({
        component_type: '',
        content: '',
        order: 0,
        language_code: 'en',
        read_aloud: true,
        enabled: true,
      });
      toast({
        title: 'Component Added',
        description: 'Lesson component has been added successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating component:', error);
      toast({
        title: 'Error',
        description: 'Failed to add lesson component.',
        variant: 'destructive',
      });
    },
  });

  // Delete lesson component mutation
  const deleteComponentMutation = useMutation({
    mutationFn: async (componentId: string) => {
      const { error } = await supabase
        .from('lesson_components')
        .delete()
        .eq('id', componentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-components', editingLesson] });
      toast({
        title: 'Component Deleted',
        description: 'Lesson component has been removed.',
      });
    },
  });

  const handleAddComponent = () => {
    if (!newComponent.component_type || !newComponent.content) {
      toast({
        title: 'Missing Information',
        description: 'Please select a component type and enter content.',
        variant: 'destructive',
      });
      return;
    }

    createComponentMutation.mutate(newComponent as Omit<LessonComponent, 'id'>);
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'instructions': return <FileText className="h-4 w-4" />;
      case 'activity': return <Activity className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const componentTypes = [
    { value: 'video', label: 'Video' },
    { value: 'instructions', label: 'Instructions' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'activity', label: 'Activity' },
    { value: 'resources', label: 'Resources' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'formativeCheck', label: 'Quick Check' },
    { value: 'rubric', label: 'Rubric' },
    { value: 'codingEditor', label: 'Code Editor' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Editor</h1>
          <p className="text-muted-foreground">
            Edit existing courses and add lesson components
          </p>
        </div>
      </div>

      {/* Track Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course to Edit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="track-select">Course Track</Label>
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course to edit" />
              </SelectTrigger>
              <SelectContent>
                {tracks?.map((track) => (
                  <SelectItem key={track} value={track}>
                    {track}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      {selectedTrack && lessons && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTrack} Course Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson['Lesson ID']}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{lesson.Title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lesson.Description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Lesson {lesson.Order}</Badge>
                      {lessonComponents && editingLesson === lesson['Lesson ID'] && (
                        <Badge variant="secondary">
                          {lessonComponents.length} components
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={editingLesson === lesson['Lesson ID'] ? 'secondary' : 'outline'}
                    onClick={() => {
                      const newEditingLesson = editingLesson === lesson['Lesson ID'] ? null : lesson['Lesson ID'];
                      console.log('Edit button clicked for lesson:', lesson['Lesson ID']);
                      console.log('Current editing lesson:', editingLesson);
                      console.log('Setting editing lesson to:', newEditingLesson);
                      setEditingLesson(newEditingLesson);
                    }}
                  >
                    {editingLesson === lesson['Lesson ID'] ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Close Editor
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Components
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Editor */}
      {editingLesson && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Lesson Components - {lessons?.find(l => l['Lesson ID'] === editingLesson)?.Title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {lessonComponents === undefined ? 'Loading components...' : 
               lessonComponents?.length === 0 ? 'No components found. Add your first component below.' :
               `Found ${lessonComponents.length} component(s)`}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Components */}
            {lessonComponents && lessonComponents.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Existing Components</h4>
                {lessonComponents.map((component) => (
                  <div
                    key={component.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getComponentIcon(component.component_type)}
                      <div>
                        <h5 className="font-medium capitalize">
                          {component.component_type}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Order: {component.order}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteComponentMutation.mutate(component.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Component */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold">Add New Component</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Component Type</Label>
                  <Select
                    value={newComponent.component_type}
                    onValueChange={(value) =>
                      setNewComponent(prev => ({ ...prev, component_type: value }))
                    }
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

                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={newComponent.order}
                    onChange={(e) =>
                      setNewComponent(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newComponent.content as string}
                  onChange={(e) =>
                    setNewComponent(prev => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Enter component content..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleAddComponent}
                disabled={createComponentMutation.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseEditor;
