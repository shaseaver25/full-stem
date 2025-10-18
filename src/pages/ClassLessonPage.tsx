import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, BookOpen, Clock, Users, ArrowLeft, Play, Target, CheckCircle, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import InlineReadAloud from '@/components/InlineReadAloud';

// Type definitions for the lesson content
interface InstructionalContent {
  overview?: string;
  learning_objectives?: string[];
  key_concepts?: string[];
  teacher_notes?: string;
  timing_guide?: Record<string, string>;
  differentiation?: Record<string, string>;
}

interface LessonContent {
  instructional_content?: InstructionalContent;
  materials_needed?: string[];
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
  const navigate = useNavigate();
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
              <div className="space-y-4">
                <div>Lesson not found or failed to load</div>
                <div className="text-sm opacity-75">Lesson ID: {lessonId}</div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate(-1)} variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={() => navigate('/teacher/dashboard')} size="sm">
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { content, activities, classes: classInfo } = lesson;
  
  // Safely cast the content to our expected structure
  const lessonContent = (typeof content === 'object' ? content : {}) as LessonContent;
  const typedActivities = activities as Activity[];
  const instructionalContent = lessonContent?.instructional_content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link to={`/teacher/classes/${lesson.class_id}`} className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {classInfo?.name || 'Class'}
          </Link>
        </div>

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

        {/* Main Content Tabs */}
        <Tabs defaultValue="student" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Student View
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Teacher Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-6">
            {/* Student Lesson Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Lesson Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instructionalContent?.overview && (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none bg-background p-6 rounded-lg border shadow-sm">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {instructionalContent.overview}
                      </div>
                    </div>
                    <div className="mt-4">
                      <InlineReadAloud text={instructionalContent.overview} language="en" />
                    </div>
                  </div>
                )}
                
                {!instructionalContent?.overview && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Lesson content is being prepared...</p>
                    <p className="text-sm mt-2">Switch to Teacher Materials tab for full lesson details.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Materials for Students */}
            {lesson.materials && lesson.materials.length > 0 && (
              <Card>
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

            {/* Activities for Students */}
            {typedActivities && typedActivities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Activities ({typedActivities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {typedActivities.map((activity) => (
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
          </TabsContent>

          <TabsContent value="teacher" className="space-y-6">
            {/* Teacher Content Overview */}
            {instructionalContent?.overview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Lesson Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{instructionalContent.overview}</p>
                </CardContent>
              </Card>
            )}

            {/* Learning Objectives for Teachers */}
            {instructionalContent?.learning_objectives && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {instructionalContent.learning_objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Teacher Notes */}
            {instructionalContent?.teacher_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Teacher Notes & Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    {instructionalContent.teacher_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Key Concepts */}
            {instructionalContent?.key_concepts && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Concepts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {instructionalContent.key_concepts.map((concept: string, index: number) => (
                      <Badge key={index} variant="secondary">{concept}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timing Guide */}
            {instructionalContent?.timing_guide && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Lesson Timing Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(instructionalContent.timing_guide).map(([phase, time]) => (
                      <div key={phase} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium capitalize">{phase.replace('_', ' ')}</span>
                        <Badge variant="secondary">{time}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Differentiation Strategies */}
            {instructionalContent?.differentiation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Differentiation Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(instructionalContent.differentiation).map(([level, strategy]) => (
                      <div key={level} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium capitalize text-primary">{level.replace('_', ' ')}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{strategy}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teacher Materials List */}
            {lesson.materials && lesson.materials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Required Materials & Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 gap-2">
                    {lesson.materials.map((material, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{material}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassLessonPage;