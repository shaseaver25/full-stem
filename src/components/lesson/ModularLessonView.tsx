import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Volume2, Book, Globe } from 'lucide-react';
import { useLessonComponents } from '@/hooks/useLessonComponents';
import { useLessonData } from '@/hooks/useLessonData';
import LessonComponentRenderer from './LessonComponentRenderer';
import DesmosSection from './DesmosSection';

interface ModularLessonViewProps {
  lessonId: string;
  lessonTitle: string;
  fullLessonText: string;
}

const ModularLessonView: React.FC<ModularLessonViewProps> = ({
  lessonId,
  lessonTitle,
  fullLessonText
}) => {
  const { data: components = [], isLoading } = useLessonComponents(lessonId);
  const { lesson } = useLessonData(lessonId);
  const [activeTab, setActiveTab] = useState<string>('');

  // Set first component as active when components load
  React.useEffect(() => {
    if (components.length > 0 && !activeTab) {
      setActiveTab(components[0].id);
    }
  }, [components, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Components Configured
          </h3>
          <p className="text-sm text-muted-foreground">
            This lesson hasn't been configured with modular components yet. 
            Contact your administrator to set up lesson components.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'instructions': return '📋';
      case 'assignment': return '📝';
      case 'activity': return '🎯';
      case 'resources': return '📚';
      case 'discussion': return '💬';
      case 'reflection': return '🤔';
      case 'formativeCheck': return '✅';
      case 'rubric': return '📊';
      case 'codingEditor': return '💻';
      case 'aiAssistant': return '🤖';
      case 'peerReview': return '👥';
      case 'checklist': return '☑️';
      case 'liveDemo': return '🎬';
      default: return '📄';
    }
  };

  const getComponentDisplayName = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'instructions': return 'Instructions';
      case 'assignment': return 'Assignment';
      case 'activity': return 'Activity';
      case 'resources': return 'Resources';
      case 'discussion': return 'Discussion';
      case 'reflection': return 'Reflection';
      case 'formativeCheck': return 'Quick Check';
      case 'rubric': return 'Rubric';
      case 'codingEditor': return 'Code Editor';
      case 'aiAssistant': return 'AI Assistant';
      case 'peerReview': return 'Peer Review';
      case 'checklist': return 'Checklist';
      case 'liveDemo': return 'Live Demo';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with global controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <h1 className="text-2xl font-bold">{lessonTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {components.length} components available
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Globe className="h-4 w-4 mr-2" />
            Translate
          </Button>
          <Button variant="outline" size="sm">
            <Book className="h-4 w-4 mr-2" />
            Reading Level
          </Button>
        </div>
      </div>

      {/* Tabbed Component View */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
          {components.map((component) => (
            <TabsTrigger
              key={component.id}
              value={component.id}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <span className="text-lg">
                {getComponentIcon(component.component_type)}
              </span>
              <span className="truncate">
                {getComponentDisplayName(component.component_type)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {components.map((component) => (
          <TabsContent key={component.id} value={component.id} className="mt-6">
            <Card>
              <CardContent className="p-6">
                {/* Component Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getComponentIcon(component.component_type)}
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {getComponentDisplayName(component.component_type)}
                      </h2>
                      <div className="flex gap-2 mt-1">
                        {component.language_code !== 'en' && (
                          <Badge variant="secondary">{component.language_code.toUpperCase()}</Badge>
                        )}
                        {component.reading_level && (
                          <Badge variant="outline">Grade {component.reading_level}</Badge>
                        )}
                        {component.read_aloud && (
                          <Badge variant="outline">
                            <Volume2 className="h-3 w-3 mr-1" />
                            Audio
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Component-specific controls */}
                  <div className="flex gap-2">
                  </div>
                </div>

                {/* Component Content */}
                <LessonComponentRenderer component={component} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Desmos Tool Section */}
      {lesson?.desmos_enabled && lesson?.desmos_type && (
        <DesmosSection desmosType={lesson.desmos_type} />
      )}
    </div>
  );
};

export default ModularLessonView;