
import React from 'react';
import HighlightedTextReader from './HighlightedTextReader';

interface ReadAloudLessonProps {
  lessonText: string;
  lessonId: string;
}

const ReadAloudLesson: React.FC<ReadAloudLessonProps> = ({ lessonText, lessonId }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <HighlightedTextReader 
        text={lessonText}
        className="w-full"
      />
    </div>
  );
};

export default ReadAloudLesson;
