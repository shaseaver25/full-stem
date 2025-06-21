import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, RotateCcw, CheckCircle } from 'lucide-react';

interface Lesson {
  'Lesson ID': number;
  Title: string;
  Description: string;
  Order: number;
  Track: string;
}

interface UserProgress {
  lesson_id: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

interface CourseOverviewProps {
  courseName: string;
  trackFilter: string;
}

const CourseOverview: React.FC<CourseOverviewProps> = ({ courseName, trackFilter }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessonsAndProgress = useCallback(async () => {
    if (!trackFilter) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching lessons for track:', trackFilter);
      
      // Fetch lessons for the specific track
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('Lessons')
        .select('*')
        .eq('Track', trackFilter)
        .order('Order', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        throw lessonsError;
      }

      console.log('Fetched lessons:', lessonsData);

      // For now, we'll create a mock progress system since the User Progress table 
      // structure needs to be clarified. We'll simulate progress data.
      const mockProgress: UserProgress[] = [];
      
      setLessons(lessonsData || []);
      setUserProgress(mockProgress);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [trackFilter]);

  useEffect(() => {
    fetchLessonsAndProgress();
  }, [fetchLessonsAndProgress]);

  const getLessonStatus = useCallback((lessonId: number): 'Not Started' | 'In Progress' | 'Completed' => {
    const progress = userProgress.find(p => p.lesson_id === lessonId);
    return progress?.status || 'Not Started';
  }, [userProgress]);

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

  const calculateProgress = useCallback(() => {
    const completedLessons = lessons.filter(lesson => 
      getLessonStatus(lesson['Lesson ID']) === 'Completed'
    ).length;
    return {
      completed: completedLessons,
      total: lessons.length,
      percentage: lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0
    };
  }, [lessons, getLessonStatus]);

  const getContinueLesson = useCallback(() => {
    // First, find any lesson in progress
    const inProgressLesson = lessons.find(lesson => 
      getLessonStatus(lesson['Lesson ID']) === 'In Progress'
    );
    
    if (inProgressLesson) return inProgressLesson;

    // Otherwise, find the first not started lesson
    const notStartedLesson = lessons.find(lesson => 
      getLessonStatus(lesson['Lesson ID']) === 'Not Started'
    );
    
    return notStartedLesson || lessons[0];
  }, [lessons, getLessonStatus]);

  const handleLessonClick = useCallback((lessonId: number) => {
    navigate(`/lesson/${lessonId}`);
  }, [navigate]);

  const handleContinueClick = useCallback(() => {
    const continueLesson = getContinueLesson();
    if (continueLesson) {
      handleLessonClick(continueLesson['Lesson ID']);
    }
  }, [getContinueLesson, handleLessonClick]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchLessonsAndProgress}>Retry</Button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const continueLesson = getContinueLesson();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{courseName}</h1>
          
          {/* Progress Summary */}
          <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Your Progress</h2>
                <p className="text-gray-600">
                  {progress.completed} of {progress.total} lessons completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(progress.percentage)}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
            <Progress value={progress.percentage} className="mb-4" />
            
            {/* Continue Button */}
            {continueLesson && (
              <Button 
                onClick={handleContinueClick}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Continue Where You Left Off
              </Button>
            )}
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => {
            const status = getLessonStatus(lesson['Lesson ID']);
            return (
              <Card key={lesson['Lesson ID']} className="hover:shadow-lg transition-shadow">
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
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleLessonClick(lesson['Lesson ID'])}
                    className="w-full"
                    variant={status === 'Completed' ? 'outline' : 'default'}
                  >
                    {getButtonIcon(status)}
                    <span className="ml-2">{getButtonText(status)}</span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No lessons found</h3>
            <p className="text-gray-500">
              There are no lessons available for {courseName} at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOverview;
