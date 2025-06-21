
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserProgress } from '@/types/courseTypes';
import { Link } from 'react-router-dom';

interface LessonStatusNavProps {
  userProgress: UserProgress | null;
  lessonId: number;
  trackName?: string;
  onMarkComplete: () => void;
  updating: boolean;
  isAuthenticated: boolean;
}

const LessonStatusNav: React.FC<LessonStatusNavProps> = ({
  userProgress,
  lessonId,
  trackName = 'excel',
  onMarkComplete,
  updating,
  isAuthenticated
}) => {
  const getStatusInfo = () => {
    if (!userProgress) {
      return {
        status: 'Not Started',
        icon: <Play className="h-4 w-4" />,
        color: 'bg-gray-100 text-gray-800',
        canComplete: true
      };
    }

    switch (userProgress.status) {
      case 'Completed':
        return {
          status: 'Completed',
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'bg-green-100 text-green-800',
          canComplete: false
        };
      case 'In Progress':
        return {
          status: 'In Progress',
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-yellow-100 text-yellow-800',
          canComplete: true
        };
      default:
        return {
          status: 'Not Started',
          icon: <Play className="h-4 w-4" />,
          color: 'bg-gray-100 text-gray-800',
          canComplete: true
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Lesson Progress</h3>
            <Badge className={statusInfo.color}>
              <div className="flex items-center gap-1">
                {statusInfo.icon}
                {statusInfo.status}
              </div>
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {isAuthenticated && statusInfo.canComplete && (
            <Button 
              onClick={onMarkComplete}
              disabled={updating}
              className="flex items-center gap-2"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Mark as Complete
                </>
              )}
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/course/${trackName}`} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to={`/lesson/${lessonId + 1}`} className="flex items-center gap-2">
                Next Lesson
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <Link to="/auth" className="font-medium underline">Log in</Link> to save your progress and track your learning journey.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonStatusNav;
