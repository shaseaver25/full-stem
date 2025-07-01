
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface LessonHeaderProps {
  lessonTitle: string;
  lessonDescription?: string;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ 
  lessonTitle, 
  lessonDescription 
}) => {
  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
          {lessonTitle}
        </CardTitle>
        {lessonDescription && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {lessonDescription}
          </p>
        )}
      </CardHeader>
    </Card>
  );
};

export default LessonHeader;
