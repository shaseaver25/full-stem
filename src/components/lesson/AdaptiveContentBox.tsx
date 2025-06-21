
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, BookOpen } from 'lucide-react';
import ReadAloudButton from '@/components/ReadAloudButton';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface AdaptiveContentBoxProps {
  content: string;
  translatedContent?: string | null;
  readingLevel?: string | null;
  lessonTitle: string;
}

const AdaptiveContentBox: React.FC<AdaptiveContentBoxProps> = ({
  content,
  translatedContent,
  readingLevel,
  lessonTitle
}) => {
  const { preferences } = useUserPreferences();
  const enableTranslation = preferences?.['Enable Translation View'];
  const enableReadAloud = preferences?.['Enable Read-Aloud'];

  const shouldShowTranslation = enableTranslation && translatedContent;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lesson Content
          </CardTitle>
          <div className="flex items-center gap-2">
            {readingLevel && (
              <Badge variant="secondary" className="text-xs">
                {readingLevel} Level
              </Badge>
            )}
            {enableReadAloud && (
              <ReadAloudButton 
                text={`${lessonTitle}. ${content}`}
                className="flex-shrink-0"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {shouldShowTranslation ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">English</h3>
                <Badge variant="outline" className="text-xs">Original</Badge>
              </div>
              <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border shadow-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {content}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <h3 className="font-semibold text-sm">{preferences?.['Preferred Language'] || 'Translation'}</h3>
                <Badge variant="outline" className="text-xs">Translation</Badge>
              </div>
              <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {translatedContent}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-lg max-w-none bg-white p-6 rounded-lg border shadow-sm">
            <p className="whitespace-pre-wrap leading-relaxed text-gray-800 text-lg">
              {content}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptiveContentBox;
