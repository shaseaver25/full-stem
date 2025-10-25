import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Search, BookOpen } from 'lucide-react';
import { useCreateLessonComponents, useLessonComponents } from '@/hooks/useLessonComponents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LessonComponentManager: React.FC = () => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [lessonSearchQuery, setLessonSearchQuery] = useState<string>('');
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [searchMode, setSearchMode] = useState<'search' | 'manual'>('search');
  const [isSearching, setIsSearching] = useState(false);
  const [newComponent, setNewComponent] = useState({
    component_type: '',
    content: '{}',
    reading_level: '',
    language_code: 'en',
    read_aloud: true,
    order: 0,
  });

  const { data: components = [] } = useLessonComponents(selectedLessonId);
  const createComponents = useCreateLessonComponents();
  const { toast } = useToast();

  // Search for lessons by title
  const searchLessons = async (query: string) => {
    if (!query.trim()) {
      setAvailableLessons([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('Lessons')
        .select('Lesson ID, Title, Track, Description')
        .ilike('Title', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setAvailableLessons(data || []);
    } catch (error) {
      console.error('Error searching lessons:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search lessons',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle lesson search input
  const handleLessonSearch = (query: string) => {
    setLessonSearchQuery(query);
    searchLessons(query);
  };

  // Select a lesson from search results
  const selectLesson = (lesson: any) => {
    setSelectedLessonId(lesson['Lesson ID'].toString());
    setLessonSearchQuery(`${lesson.Title} (ID: ${lesson['Lesson ID']})`);
    setAvailableLessons([]);
  };

  // Get selected lesson info for display
  const selectedLessonInfo = useMemo(() => {
    if (!selectedLessonId) return null;
    
    // Try to find from search results first
    const fromSearch = availableLessons.find(l => l['Lesson ID'].toString() === selectedLessonId);
    if (fromSearch) return fromSearch;
    
    // If manually entered, just show the ID
    return { 'Lesson ID': selectedLessonId, Title: 'Manual Entry' };
  }, [selectedLessonId, availableLessons]);

  const componentTypes = [
    { value: 'video', label: '🎥 Video' },
    { value: 'instructions', label: '📋 Instructions' },
    { value: 'assignment', label: '📝 Assignment' },
    { value: 'activity', label: '🎯 Activity' },
    { value: 'resources', label: '📚 Resources' },
    { value: 'discussion', label: '💬 Discussion' },
    { value: 'reflection', label: '🤔 Reflection' },
    { value: 'formativeCheck', label: '✅ Quick Check' },
    { value: 'rubric', label: '📊 Rubric' },
    { value: 'checklist', label: '☑️ Checklist' },
    { value: 'codingEditor', label: '💻 Code Editor' },
  ];

  const handleCreateComponent = async () => {
    if (!selectedLessonId || !newComponent.component_type) {
      toast({
        title: 'Missing Information',
        description: 'Please select a lesson and component type',
        variant: 'destructive',
      });
      return;
    }

    try {
      let content = {};
      try {
        content = JSON.parse(newComponent.content);
      } catch {
        // If JSON parse fails, treat as simple text content
        content = { text: newComponent.content };
      }

      await createComponents.mutateAsync([{
        lesson_id: selectedLessonId,
        component_type: newComponent.component_type as any,
        content,
        reading_level: newComponent.reading_level ? Number(newComponent.reading_level) : undefined,
        language_code: newComponent.language_code,
        read_aloud: newComponent.read_aloud,
        order: newComponent.order,
        enabled: true,
        is_assignable: false,
      }]);

      toast({
        title: 'Component Created',
        description: 'Lesson component has been added successfully',
      });

      // Reset form
      setNewComponent({
        component_type: '',
        content: '{}',
        reading_level: '',
        language_code: 'en',
        read_aloud: true,
        order: components.length,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create lesson component',
        variant: 'destructive',
      });
    }
  };

  const getContentPreview = (content: any) => {
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    return str.length > 100 ? str.substring(0, 100) + '...' : str;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Lesson Component Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lesson Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Lesson Selection Method</Label>
              <div className="flex gap-2">
                <Button
                  variant={searchMode === 'search' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('search')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search by Title
                </Button>
                <Button
                  variant={searchMode === 'manual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('manual')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manual ID
                </Button>
              </div>
            </div>

            {searchMode === 'search' ? (
              <div className="space-y-2">
                <Label htmlFor="lesson-search">Search Lessons by Title</Label>
                <div className="relative">
                  <Input
                    id="lesson-search"
                    placeholder="Type lesson title to search..."
                    value={lessonSearchQuery}
                    onChange={(e) => handleLessonSearch(e.target.value)}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                
                {/* Search Results */}
                {availableLessons.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {availableLessons.map((lesson) => (
                      <div
                        key={lesson['Lesson ID']}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => selectLesson(lesson)}
                      >
                        <div className="font-medium">{lesson.Title}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {lesson['Lesson ID']} • Track: {lesson.Track || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="lesson-id">Lesson ID</Label>
                <Input
                  id="lesson-id"
                  type="number"
                  placeholder="Enter lesson ID (e.g., 1, 2, 3...)"
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                />
              </div>
            )}

            {/* Selected Lesson Display */}
            {selectedLessonInfo && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Selected Lesson</Badge>
                  <span className="font-medium">{selectedLessonInfo.Title}</span>
                  <Badge variant="secondary">ID: {selectedLessonInfo['Lesson ID']}</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Component Creation Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="component-type">Component Type</Label>
              <Select value={newComponent.component_type} onValueChange={(value) => 
                setNewComponent(prev => ({ ...prev, component_type: value }))
              }>
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

            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={newComponent.order}
                onChange={(e) => setNewComponent(prev => ({ ...prev, order: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="reading-level">Reading Level (Optional)</Label>
              <Input
                id="reading-level"
                type="number"
                placeholder="e.g., 3, 5, 8"
                value={newComponent.reading_level}
                onChange={(e) => setNewComponent(prev => ({ ...prev, reading_level: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={newComponent.language_code} onValueChange={(value) => 
                setNewComponent(prev => ({ ...prev, language_code: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="so">Somali</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content (JSON or Text)</Label>
            <Textarea
              id="content"
              placeholder='{"title": "Example", "description": "Content description", "url": "https://..."}'
              value={newComponent.content}
              onChange={(e) => setNewComponent(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              For video: {"{"}"url": "video-url", "title": "Video Title"{"}"}
              <br />
              For text: {"{"}"text": "Your content here"{"}"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="read-aloud"
              checked={newComponent.read_aloud}
              onChange={(e) => setNewComponent(prev => ({ ...prev, read_aloud: e.target.checked }))}
            />
            <Label htmlFor="read-aloud">Enable Read-Aloud</Label>
          </div>

          <Button 
            onClick={handleCreateComponent}
            disabled={createComponents.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {createComponents.isPending ? 'Creating...' : 'Create Component'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Components */}
      {selectedLessonId && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Components for Lesson {selectedLessonId}</CardTitle>
          </CardHeader>
          <CardContent>
            {components.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No components found for this lesson.
              </p>
            ) : (
              <div className="space-y-3">
                {components.map((component) => (
                  <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant="outline">
                          {componentTypes.find(t => t.value === component.component_type)?.label || component.component_type}
                        </Badge>
                        <Badge variant="secondary">Order: {component.order}</Badge>
                        {component.reading_level && (
                          <Badge variant="outline">Grade {component.reading_level}</Badge>
                        )}
                        <Badge variant={component.language_code === 'en' ? 'outline' : 'default'}>
                          {component.language_code.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getContentPreview(component.content)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonComponentManager;
