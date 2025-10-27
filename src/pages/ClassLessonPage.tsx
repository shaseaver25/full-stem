import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, BookOpen, Clock, Users, ArrowLeft, Play, Target, CheckCircle, GraduationCap, FileText, ClipboardCheck, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import InlineReadAloud from '@/components/InlineReadAloud';
import { useToast } from '@/hooks/use-toast';

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

interface LessonComponent {
  id: string;
  component_type: string;
  content: any;
  order: number;
  enabled: boolean;
  is_assignable: boolean;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
}

const ClassLessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);
  const [deleteComponentId, setDeleteComponentId] = useState<string | null>(null);

  // Fetch lesson with activities and components
  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['classLesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          classes (name, grade_level, subject),
          activities (*),
          lesson_components (*)
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  // Delete component mutation
  const deleteComponentMutation = useMutation({
    mutationFn: async (componentId: string) => {
      const { error } = await supabase
        .from('lesson_components')
        .delete()
        .eq('id', componentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classLesson', lessonId] });
      toast({
        title: 'Content Deleted',
        description: 'Lesson content has been successfully deleted.',
      });
      setDeleteComponentId(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete content. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete error:', error);
    },
  });

  const toggleActivity = (activityId: string) => {
    setExpandedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleEditComponent = (componentId: string) => {
    // Navigate to lesson builder with component to edit
    navigate(`/teacher/build-class/${lesson.class_id}?lesson=${lessonId}&component=${componentId}`);
  };

  const handleDeleteComponent = (componentId: string) => {
    setDeleteComponentId(componentId);
  };

  const confirmDelete = () => {
    if (deleteComponentId) {
      deleteComponentMutation.mutate(deleteComponentId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
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

  const { content, activities, classes: classInfo, lesson_components } = lesson;
  
  // Safely cast the content to our expected structure
  const lessonContent = (typeof content === 'object' ? content : {}) as LessonContent;
  const typedActivities = activities as Activity[];
  const instructionalContent = lessonContent?.instructional_content;
  
  // Separate lesson components by is_assignable flag
  const components = (lesson_components || []) as LessonComponent[];
  const lessonComponents = components
    .filter(c => !c.is_assignable && c.enabled)
    .sort((a, b) => a.order - b.order);
  const assignmentComponents = components
    .filter(c => c.is_assignable && c.enabled)
    .sort((a, b) => a.order - b.order);
  
  // Component type labels for display
  const componentTypeLabels: Record<string, string> = {
    slides: 'PowerPoint/Slides',
    page: 'Page',
    video: 'Multimedia',
    discussion: 'Discussion',
    codingEditor: 'Coding IDE',
    desmos: 'Desmos Activity',
    activity: 'Activity',
    assignment: 'Assignment',
    assessment: 'Assessment',
    reflection: 'Reflection',
    instructions: 'Instructions',
    resources: 'Resources',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
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
        <Tabs defaultValue="lesson" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="lesson" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Lesson Content
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Assignments
              {assignmentComponents.length > 0 && (
                <Badge variant="secondary" className="ml-1">{assignmentComponents.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Teacher Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lesson" className="space-y-6">
            {/* Lesson Components */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lesson Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lessonComponents.length > 0 ? (
                  <div className="space-y-6">
                    {lessonComponents.map((component) => (
                      <div key={component.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">
                              {componentTypeLabels[component.component_type] || component.component_type}
                            </Badge>
                            {component.content?.title && (
                              <h4 className="font-semibold text-lg">{component.content.title}</h4>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditComponent(component.id)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteComponent(component.id)}
                              className="flex items-center gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {component.content?.body && (
                            <div dangerouslySetInnerHTML={{ __html: component.content.body }} />
                          )}
                          {component.content?.text && (
                            <div className="whitespace-pre-wrap">{component.content.text}</div>
                          )}
                          {component.content?.prompt && (
                            <div className="italic text-muted-foreground">{component.content.prompt}</div>
                          )}
                          {component.content?.url && (
                            <div className="mt-2">
                              <a href={component.content.url} target="_blank" rel="noopener noreferrer" 
                                 className="text-primary hover:underline">
                                View Resource →
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {component.read_aloud && (component.content?.body || component.content?.text) && (
                          <div className="mt-4">
                            <InlineReadAloud 
                              text={component.content.body || component.content.text} 
                              language={component.language_code || 'en'} 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No lesson content available yet.</p>
                    <p className="text-sm mt-2">Content will appear here once the teacher adds it.</p>
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

            {/* Legacy Activities (if any) */}
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

          <TabsContent value="assignments" className="space-y-6">
            {/* Assignment Components */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignmentComponents.length > 0 ? (
                  <div className="space-y-6">
                     {assignmentComponents.map((component) => (
                      <div key={component.id} className="border rounded-lg p-4 bg-card border-primary/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default">
                                {componentTypeLabels[component.component_type] || component.component_type}
                              </Badge>
                              {component.content?.points && (
                                <Badge variant="outline">
                                  {component.content.points} points
                                </Badge>
                              )}
                              {component.content?.dueDate && (
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Due: {new Date(component.content.dueDate).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                            {component.content?.title && (
                              <h4 className="font-semibold text-lg">{component.content.title}</h4>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditComponent(component.id)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteComponent(component.id)}
                              className="flex items-center gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {component.content?.description && (
                            <p className="text-muted-foreground mb-2">{component.content.description}</p>
                          )}
                          {component.content?.body && (
                            <div dangerouslySetInnerHTML={{ __html: component.content.body }} />
                          )}
                          {component.content?.text && (
                            <div className="whitespace-pre-wrap">{component.content.text}</div>
                          )}
                          {component.content?.prompt && (
                            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                              <p className="font-medium mb-1">Assignment Prompt:</p>
                              <p>{component.content.prompt}</p>
                            </div>
                          )}
                        </div>
                        
                        {component.content?.resources && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Resources:</p>
                            <div className="text-sm text-muted-foreground">{component.content.resources}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No assignments available yet.</p>
                    <p className="text-sm mt-2">Your teacher hasn't assigned any work for this lesson.</p>
                  </div>
                )}
              </CardContent>
            </Card>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteComponentId} onOpenChange={() => setDeleteComponentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson Content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this lesson content. This action cannot be undone.
              Students will no longer be able to access this content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassLessonPage;