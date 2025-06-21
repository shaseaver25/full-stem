
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReadAloudButton from '@/components/ReadAloudButton';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();

  const lessonContent = `This is a placeholder for lesson content. The actual lesson content will be implemented here. Lesson ID: ${lessonId}`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link 
              to="/course/excel" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Lesson {lessonId}
              </CardTitle>
              <div className="mt-4">
                <ReadAloudButton 
                  text={`Lesson ${lessonId}. ${lessonContent}`}
                  className="justify-center"
                />
              </div>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-6">
                {lessonContent}
              </p>
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LessonPage;
