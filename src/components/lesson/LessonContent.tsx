
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe } from 'lucide-react';
import AdaptiveContentBox from './AdaptiveContentBox';
import ReadAloudButton from '@/components/ReadAloudButton';

interface LessonContentProps {
  showPersonalizedView: boolean;
  lessonContent: string;
  translatedContent?: string | null;
  lessonTitle: string;
  liveTranslatedContent: string | null;
  liveTranslationLanguage: string | null;
}

const LessonContent: React.FC<LessonContentProps> = ({
  showPersonalizedView,
  lessonContent,
  translatedContent,
  lessonTitle,
  liveTranslatedContent,
  liveTranslationLanguage
}) => {
  if (showPersonalizedView) {
    return (
      <div className="space-y-6">
        <AdaptiveContentBox
          content={liveTranslatedContent || lessonContent}
          translatedContent={translatedContent}
          readingLevel={null}
          lessonTitle={lessonTitle}
        />
      </div>
    );
  }

  // Combine title and content for comprehensive read-aloud
  const fullEnglishText = `${lessonTitle}. ${lessonContent}`;
  const fullTranslatedText = liveTranslatedContent ? `${lessonTitle}. ${liveTranslatedContent}` : '';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lesson Content
            {liveTranslatedContent && liveTranslationLanguage && (
              <Badge variant="outline" className="ml-2">
                <Globe className="h-3 w-3 mr-1" />
                Translation Available
              </Badge>
            )}
          </div>
          <ReadAloudButton 
            text={liveTranslatedContent && liveTranslationLanguage ? fullTranslatedText : fullEnglishText}
            className="flex-shrink-0"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-6 ${liveTranslatedContent && liveTranslationLanguage ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* English content - always shown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              English (Original)
            </h3>
            <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border shadow-sm">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                {lessonContent}
              </p>
            </div>
          </div>

          {/* Translated content - only shown when available */}
          {liveTranslatedContent && liveTranslationLanguage && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {liveTranslationLanguage} (Translation)
              </h3>
              <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {liveTranslatedContent}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonContent;
