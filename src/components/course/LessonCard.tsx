
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, RotateCcw, CheckCircle } from 'lucide-react';
import { Lesson } from '@/types/courseTypes';

interface LessonCardProps {
  lesson: Lesson;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progressPercentage: number;
  onLessonClick: (lessonId: number) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  status,
  progressPercentage,
  onLessonClick
}) => {
  const getButtonText = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'Review';
      case 'In Progress':
        return 'Resume';
      default:
        return 'Start';
    }
  };

  const getButtonIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <RotateCcw className="h-4 w-4" />;
      case 'In Progress':
        return <Play className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'Completed': 'default',
      'In Progress': 'secondary',
      'Not Started': 'outline'
    };

    const colors = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'Not Started': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status === 'Completed' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              {lesson.Title || `Lesson ${lesson.Order}`}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {lesson.Description || 'No description available'}
            </CardDescription>
          </div>
          <div className="ml-4">
            {getStatusBadge(status)}
          </div>
        </div>
        
        {/* Show progress bar for in-progress lessons */}
        {status === 'In Progress' && progressPercentage > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => onLessonClick(lesson['Lesson ID'])}
          className="w-full"
          variant={status === 'Completed' ? 'outline' : 'default'}
        >
          {getButtonIcon(status)}
          <span className="ml-2">{getButtonText(status)}</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
