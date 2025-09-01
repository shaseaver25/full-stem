import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, BookOpen, Clock, Users, ArrowLeft, Play, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import InlineReadAloud from '@/components/InlineReadAloud';
import TeacherLessonView from '@/components/lesson/TeacherLessonView';

// Type definitions for the lesson content
interface LessonContent {
  instructions?: string;
  videos?: Array<{
    id?: string;
    title?: string;
    url?: string;
  }>;
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  activity_type: string;
  estimated_time: number;
  instructions?: string;
  resources?: string[];
}

const ClassLessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);

  // Fetch lesson with activities
  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['classLesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          classes (name, grade_level, subject),
          activities (*)
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  const toggleActivity = (activityId: string) => {
    setExpandedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <div className="text-lg font-medium">Loading lesson content...</div>
                <div className="text-sm text-gray-500 mt-1">Lesson ID: {lessonId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>Lesson not found or failed to load</div>
                <div className="text-sm opacity-75">Lesson ID: {lessonId}</div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { content, activities, classes: classInfo } = lesson;
  
  // Safely cast the content to our expected structure
  const lessonContent = content as LessonContent;
  const typedActivities = activities as Activity[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link to={`/teacher/class/${lesson.class_id}`} className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {classInfo?.name || 'Class'}
          </Link>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Student View
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Teacher View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Lesson Header */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        {lesson.title}
                      </CardTitle>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {lesson.duration} minutes
                        </Badge>
                        <Badge variant="outline">{classInfo?.grade_level}</Badge>
                        <Badge variant="outline">{classInfo?.subject}</Badge>
                        {typedActivities && typedActivities.length > 0 && (
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {typedActivities.length} activities
                          </Badge>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-gray-600 leading-relaxed">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

        {/* Learning Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lesson Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lessonContent?.instructions && (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none bg-background p-6 rounded-lg border shadow-sm">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {lessonContent.instructions}
                  </div>
                </div>
                <div className="mt-4">
                  <InlineReadAloud text={lessonContent.instructions} language="en" />
                </div>
              </div>
            )}
            
            {(!lessonContent?.instructions || lessonContent.instructions.trim() === '') && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No detailed content available for this lesson yet.</p>
                <p className="text-sm mt-2">Content may be added through activities and assignments.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials */}
        {lesson.materials && lesson.materials.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Materials Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {lesson.materials.map((material, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{material}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Activities */}
        {typedActivities && typedActivities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Activities ({typedActivities.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typedActivities.map((activity, index) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{activity.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {activity.activity_type}
                          </Badge>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.estimated_time} min
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActivity(activity.id)}
                      >
                        <Play className={`h-4 w-4 transition-transform ${
                          expandedActivities.includes(activity.id) ? 'rotate-90' : ''
                        }`} />
                      </Button>
                    </div>
                    
                    {activity.description && (
                      <p className="text-gray-600 mb-3">{activity.description}</p>
                    )}

                    {expandedActivities.includes(activity.id) && (
                      <div className="space-y-4 mt-4 pt-4 border-t">
                        {activity.instructions && (
                          <div>
                            <h5 className="font-medium mb-2">Instructions:</h5>
                            <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                              {activity.instructions}
                            </div>
                          </div>
                        )}
                        
                        {activity.resources && activity.resources.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Resources:</h5>
                            <ul className="space-y-1">
                              {activity.resources.map((resource, resIndex) => (
                                <li key={resIndex} className="flex items-center gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                  <span>{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

              {/* Videos */}
              {lessonContent?.videos && lessonContent.videos.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lessonContent.videos.map((video, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{video.title || `Video ${index + 1}`}</h4>
                          {video.url && (
                            <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                              <p className="text-gray-500">Video: {video.url}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="teacher">
            <TeacherLessonView 
              lesson={lesson}
              activities={typedActivities}
              assignments={[]}
              resources={[]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassLessonPage;