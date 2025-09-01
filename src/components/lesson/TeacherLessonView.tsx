import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, BookOpen, Target, CheckCircle, Video, Link, FileText } from 'lucide-react';

interface TeacherLessonViewProps {
  lesson: {
    id: string;
    title: string;
    description?: string;
    content: any;
    materials: string[];
    objectives: string[];
    duration: number;
  };
  activities?: any[];
  assignments?: any[];
  resources?: any[];
}

const TeacherLessonView: React.FC<TeacherLessonViewProps> = ({ 
  lesson, 
  activities = [],
  assignments = [],
  resources = []
}) => {
  const instructionalContent = lesson.content?.instructional_content || {};
  const materialsNeeded = lesson.content?.materials_needed || lesson.materials || [];
  const timingGuide = instructionalContent.timing_guide || {};
  const differentiation = instructionalContent.differentiation || {};

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'interactive_tool': return <Link className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Link className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-primary">{lesson.title}</CardTitle>
              <p className="text-muted-foreground mt-2">{lesson.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.duration} min
              </Badge>
              <Badge variant="outline">Ready to Teach</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(instructionalContent.learning_objectives || lesson.objectives || []).map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Key Concepts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(instructionalContent.key_concepts || []).map((concept: string, index: number) => (
                    <Badge key={index} variant="secondary">{concept}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {instructionalContent.overview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lesson Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{instructionalContent.overview}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {instructionalContent.teacher_notes && (
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

          {instructionalContent.case_studies && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Studies to Discuss</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {instructionalContent.case_studies.map((study: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{study}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {instructionalContent.tool_demonstrations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tool Demonstrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {instructionalContent.tool_demonstrations.map((tool: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="text-sm font-medium">{tool}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lesson Timing Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(timingGuide).map(([phase, time]) => (
                  <div key={phase} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{phase.replace('_', ' ')}</span>
                    <Badge variant="secondary">{time as string}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {differentiation && Object.keys(differentiation).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Differentiation Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(differentiation).map(([level, strategy]) => (
                    <div key={level} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium capitalize text-primary">{level.replace('_', ' ')}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{strategy as string}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {materialsNeeded.map((material: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{material}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <Card key={activity.id || index}>
                <CardHeader>
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {activity.estimated_time || activity.duration || 30} minutes
                      </Badge>
                      <Badge variant="secondary">{activity.activity_type || 'Activity'}</Badge>
                    </div>
                    {activity.instructions && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm">{activity.instructions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No activities configured for this lesson yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {resources.length > 0 ? (
            <div className="grid gap-4">
              {resources.map((resource, index) => (
                <Card key={resource.id || index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getResourceIcon(resource.resource_type)}
                      <div className="flex-1">
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                        {resource.url && (
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                          >
                            <Link className="h-3 w-3" />
                            Open Resource
                          </a>
                        )}
                        <Badge variant="outline" className="ml-auto">
                          {resource.resource_type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No resources configured for this lesson yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherLessonView;