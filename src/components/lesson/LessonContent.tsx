
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe } from 'lucide-react';
import AdaptiveContentBox from './AdaptiveContentBox';

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Standard Lesson Content
          {liveTranslatedContent && liveTranslationLanguage && (
            <Badge variant="outline" className="ml-2">
              Live translation available
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {liveTranslatedContent && liveTranslationLanguage ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">English (Original)</h3>
              <iframe 
                src="https://docs.google.com/document/d/1U8cD5O28L4HFNVsfNpchR08RIDiPdj1C99EEV7YaKxo/preview" 
                width="100%" 
                height="500px" 
                style={{ border: 'none' }}
                title="Lesson Content"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <h3 className="font-semibold text-sm">{liveTranslationLanguage} (Live Translation)</h3>
              </div>
              <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm h-[500px] overflow-y-auto">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {liveTranslatedContent}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <iframe 
            src="https://docs.google.com/document/d/1U8cD5O28L4HFNVsfNpchR08RIDiPdj1C99EEV7YaKxo/preview" 
            width="100%" 
            height="600px" 
            style={{ border: 'none' }}
            title="Lesson Content"
            className="rounded-b-lg"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default LessonContent;
