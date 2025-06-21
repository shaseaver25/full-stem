
import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyLessonsStateProps {
  courseName: string;
}

const EmptyLessonsState: React.FC<EmptyLessonsStateProps> = ({ courseName }) => {
  return (
    <div className="text-center py-12">
      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No lessons found</h3>
      <p className="text-gray-500">
        There are no lessons available for {courseName} at the moment.
      </p>
    </div>
  );
};

export default EmptyLessonsState;
