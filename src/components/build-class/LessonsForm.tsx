
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Video, Trash2, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lesson, Video as VideoType } from '@/types/buildClassTypes';
import LessonPlanUploader from './LessonPlanUploader';
import LessonPreview from './LessonPreview';

interface LessonsFormProps {
  lessons: Lesson[];
  currentLesson: Partial<Lesson>;
  setCurrentLesson: React.Dispatch<React.SetStateAction<Partial<Lesson>>>;
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
  const [parsedLesson, setParsedLesson] = useState<any>(null);

  const handleLessonParsed = (lesson: any) => {
    setParsedLesson(lesson);
  };

  const handleConfirmParsedLesson = (lesson: any) => {
    // Convert parsed lesson to our lesson format
    const newLesson: Partial<Lesson> = {
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
        .filter((text: string) => text.trim())
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
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">Smart Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Lesson */}
            <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Lesson
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Lesson Title</Label>
            <Input
              value={currentLesson.title || ''}
              onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
              placeholder="Enter lesson title"
            />
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
            <div className="flex items-center justify-between">
              <Label>Videos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVideoToLesson}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {currentLesson.videos?.map((video, index) => (
                <div key={video.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Video {index + 1}</Label>
                    {currentLesson.videos!.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideoFromLesson(video.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Video title"
                      value={video.title}
                      onChange={(e) => updateLessonVideo(video.id, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={video.url}
                      onChange={(e) => updateLessonVideo(video.id, 'url', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={currentLesson.duration || 60}
                onChange={(e) => setCurrentLesson({...currentLesson, duration: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input
                type="number"
                value={currentLesson.order || lessons.length + 1}
                onChange={(e) => setCurrentLesson({...currentLesson, order: parseInt(e.target.value)})}
              />
            </div>
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

          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea
              value={currentLesson.instructions || ''}
              onChange={(e) => setCurrentLesson({...currentLesson, instructions: e.target.value})}
              placeholder="Detailed lesson instructions"
              rows={4}
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

          <Button onClick={addLesson} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons ({lessons.length})</CardTitle>
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
                  <span>Order: {lesson.order}</span>
                  <span>{lesson.videos.length} video(s)</span>
                </div>
              </div>
            ))}
            {lessons.length === 0 && (
              <p className="text-gray-500 text-center py-8">No lessons added yet</p>
            )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
    
    <TabsContent value="upload" className="space-y-6">
      <LessonPlanUploader onLessonParsed={handleLessonParsed} />
    </TabsContent>
  </Tabs>
</div>
  );
};

export default LessonsForm;
