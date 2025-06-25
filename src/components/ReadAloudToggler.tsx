
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Info } from 'lucide-react';
import ReadAloudLesson from './ReadAloudLesson';

interface ReadAloudTogglerProps {
  lessonText: string;
  lessonId: string;
}

const ReadAloudToggler: React.FC<ReadAloudTogglerProps> = ({ lessonText, lessonId }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  console.log('ReadAloudToggler rendering with text length:', lessonText?.length || 0);

  // Calculate estimated reading time (average 200 words per minute)
  const wordCount = lessonText?.split(/\s+/).length || 0;
  const estimatedMinutes = Math.ceil(wordCount / 200);

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Button
          onClick={toggleVisibility}
          variant="outline"
          className="flex items-center gap-2 min-w-[140px]"
        >
          {isVisible ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {isVisible ? 'Hide Read Aloud' : 'Show Read Aloud'}
        </Button>
        
        {!isVisible && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            <span>~{estimatedMinutes} min reading time</span>
          </div>
        )}
      </div>
      
      {isVisible && (
        <div className="mt-4">
          <ReadAloudLesson
            lessonText={lessonText}
            lessonId={lessonId}
          />
        </div>
      )}
    </div>
  );
};

export default ReadAloudToggler;
