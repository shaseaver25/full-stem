
import React from 'react';
import ReadAloudButton from './ReadAloudButton';

interface ReadAloudLessonProps {
  lessonText: string;
  lessonId: string;
}

const ReadAloudLesson: React.FC<ReadAloudLessonProps> = ({ lessonText, lessonId }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <ReadAloudButton 
          text={lessonText} 
          className="mb-4"
        />
      </div>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-800 leading-relaxed">
          {lessonText}
        </p>
      </div>
    </div>
  );
};

export default ReadAloudLesson;
