
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TouchFriendlyButton from '@/components/ui/TouchFriendlyButton';

interface LessonControlsProps {
  showPersonalizedView: boolean;
  onToggleLessonView: () => void;
  fullLessonText: string;
  lessonId: string;
}

const LessonControls: React.FC<LessonControlsProps> = ({
  showPersonalizedView,
  onToggleLessonView,
  fullLessonText,
  lessonId
}) => {
  return (
    <>
      {/* Read Aloud Toggler */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Audio Reading</h3>
              <p className="text-gray-600 text-sm">
                Listen to the entire lesson content including title, description, and main content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Toggle Switch */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Content View</h3>
              <p className="text-gray-600 text-sm">
                {showPersonalizedView 
                  ? 'Currently showing personalized content based on your profile preferences.'
                  : 'Currently showing the standard lesson format with interactive document.'
                }
              </p>
            </div>
            <TouchFriendlyButton 
              onClick={onToggleLessonView}
              variant={showPersonalizedView ? "default" : "outline"}
              className={`min-w-[200px] ${
                showPersonalizedView 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'border-green-500 text-green-500 hover:bg-green-50'
              }`}
            >
              {showPersonalizedView ? 'Using Profile Settings' : 'Use Profile Settings'}
            </TouchFriendlyButton>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default LessonControls;
