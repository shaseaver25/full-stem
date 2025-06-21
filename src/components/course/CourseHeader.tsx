
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson, CourseProgress } from '@/types/courseTypes';

interface CourseHeaderProps {
  courseName: string;
  progress: CourseProgress;
  continueLesson: Lesson | undefined;
  onContinueClick: () => void;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  courseName,
  progress,
  continueLesson,
  onContinueClick
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
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
        {continueLesson && user && (
          <Button 
            onClick={onContinueClick}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Continue Where You Left Off
          </Button>
        )}
        
        {/* Sign in prompt for non-authenticated users */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Sign in to track your progress and continue where you left off.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseHeader;
