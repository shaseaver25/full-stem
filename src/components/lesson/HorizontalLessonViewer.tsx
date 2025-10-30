import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Clock,
  BookOpen,
  Activity,
  MessageSquare,
  FileText,
  Lightbulb,
  Video,
  Target
} from 'lucide-react';
import InlineReadAloud from '@/components/InlineReadAloud';

interface LessonComponent {
  id: string;
  component_type: string;
  content: {
    title?: string;
    text?: string;
    body?: string;
    prompt?: string;
  };
  order: number;
  enabled: boolean;
  estimated_time?: number;
  is_assignable?: boolean;
}

interface HorizontalLessonViewerProps {
  components: LessonComponent[];
  lessonTitle: string;
  totalDuration?: number;
  onComplete?: () => void;
}

const componentTypeConfig: Record<string, { 
  icon: React.ReactNode; 
  label: string; 
  bgColor: string;
  textColor: string;
}> = {
  'instructions': { 
    icon: <Target className="w-4 h-4" />, 
    label: 'Instructions',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    textColor: 'text-yellow-800 dark:text-yellow-200'
  },
  'page': { 
    icon: <BookOpen className="w-4 h-4" />, 
    label: 'Reading',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    textColor: 'text-blue-800 dark:text-blue-200'
  },
  'activity': { 
    icon: <Activity className="w-4 h-4" />, 
    label: 'Activity',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-800 dark:text-green-200'
  },
  'discussion': { 
    icon: <MessageSquare className="w-4 h-4" />, 
    label: 'Discussion',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    textColor: 'text-purple-800 dark:text-purple-200'
  },
  'resources': { 
    icon: <FileText className="w-4 h-4" />, 
    label: 'Resources',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    textColor: 'text-orange-800 dark:text-orange-200'
  },
  'multimedia': { 
    icon: <Video className="w-4 h-4" />, 
    label: 'Video',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    textColor: 'text-teal-800 dark:text-teal-200'
  },
  'assignment': { 
    icon: <FileText className="w-4 h-4" />, 
    label: 'Assignment',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    textColor: 'text-rose-800 dark:text-rose-200'
  },
  'reflection': { 
    icon: <Lightbulb className="w-4 h-4" />, 
    label: 'Reflection',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    textColor: 'text-amber-800 dark:text-amber-200'
  },
};

export default function HorizontalLessonViewer({ 
  components, 
  lessonTitle,
  totalDuration,
  onComplete 
}: HorizontalLessonViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedComponents, setCompletedComponents] = useState<Set<number>>(new Set());

  const enabledComponents = components.filter(c => c.enabled).sort((a, b) => a.order - b.order);
  const currentComponent = enabledComponents[currentIndex];
  const totalComponents = enabledComponents.length;
  const progressPercentage = (completedComponents.size / totalComponents) * 100;

  const typeConfig = currentComponent 
    ? componentTypeConfig[currentComponent.component_type] || componentTypeConfig['page']
    : componentTypeConfig['page'];

  const handleNext = () => {
    if (currentIndex < totalComponents - 1) {
      markAsComplete();
      setCurrentIndex(currentIndex + 1);
    } else {
      markAsComplete();
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const markAsComplete = () => {
    setCompletedComponents(prev => new Set([...prev, currentIndex]));
  };

  const jumpToComponent = (index: number) => {
    setCurrentIndex(index);
  };

  const getComponentContent = (component: LessonComponent) => {
    const content = component.content;
    if (content.body) return content.body;
    if (content.text) return content.text;
    if (content.prompt) return content.prompt;
    return '';
  };

  if (!currentComponent) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No components available for this lesson.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">{lessonTitle}</h2>
            {totalDuration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {totalDuration} min total
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Component {currentIndex + 1} of {totalComponents}
              </span>
              <span className="font-medium text-primary">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {enabledComponents.map((component, index) => {
          const isCompleted = completedComponents.has(index);
          const isCurrent = index === currentIndex;
          const config = componentTypeConfig[component.component_type] || componentTypeConfig['page'];
          
          return (
            <button
              key={component.id}
              onClick={() => jumpToComponent(index)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                isCurrent 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : isCompleted
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
              {index + 1}. {config.label}
            </button>
          );
        })}
      </div>

      {/* Main Component Card */}
      <Card className={`${typeConfig.bgColor} border-2`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                {typeConfig.icon}
              </div>
              <div>
                <Badge variant="outline" className={`${typeConfig.textColor} mb-1`}>
                  {typeConfig.label}
                </Badge>
                <CardTitle className="text-2xl">
                  {currentComponent.content.title || `Section ${currentIndex + 1}`}
                </CardTitle>
              </div>
            </div>
            {currentComponent.estimated_time && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{currentComponent.estimated_time} min
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <InlineReadAloud 
              text={getComponentContent(currentComponent)}
              className="w-full"
            />
          </div>

          {currentComponent.is_assignable && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <FileText className="w-4 h-4" />
                This component can be submitted as an assignment
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {!completedComponents.has(currentIndex) && (
                <Button
                  variant="outline"
                  onClick={markAsComplete}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}
              {completedComponents.has(currentIndex) && (
                <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </Badge>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentIndex === totalComponents - 1 && completedComponents.has(currentIndex)}
            >
              {currentIndex === totalComponents - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Message */}
      {currentIndex === totalComponents - 1 && completedComponents.has(currentIndex) && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/30">
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
              Lesson Complete! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Great work! You've completed all {totalComponents} components.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
