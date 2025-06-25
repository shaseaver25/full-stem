
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
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

  console.log('ReadAloudToggler rendering with text:', lessonText?.substring(0, 100) + '...');

  return (
    <div className="space-y-4">
      <Button
        onClick={toggleVisibility}
        variant="outline"
        className="flex items-center gap-2"
      >
        {isVisible ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {isVisible ? 'Hide Read Aloud' : 'Show Read Aloud'}
      </Button>
      
      {isVisible && (
        <ReadAloudLesson
          lessonText={lessonText}
          lessonId={lessonId}
        />
      )}
    </div>
  );
};

export default ReadAloudToggler;
