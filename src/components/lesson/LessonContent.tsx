
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe } from 'lucide-react';
import AdaptiveContentBox from './AdaptiveContentBox';
import InlineReadAloud from '@/components/InlineReadAloud';

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
                {liveTranslationLanguage} Translation
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-6 ${liveTranslatedContent && liveTranslationLanguage ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* English content pane - always shown on left */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-lg text-primary">English (Primary Instruction)</h3>
              <Badge variant="secondary">Original</Badge>
            </div>
            <div className="prose prose-sm max-w-none bg-background p-6 rounded-lg border shadow-sm min-h-[400px]">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                {lessonContent}
              </div>
            </div>
            {/* Accessibility features */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>📖 Screen reader compatible</span>
              <span>•</span>
              <span>🎯 IEP/504 accommodations supported</span>
            </div>
            {/* Read aloud integration */}
            <div className="mt-4">
              <InlineReadAloud text={lessonContent} language="en" />
            </div>
          </div>

          {/* Translated content pane - only shown when translation is available */}
          {liveTranslatedContent && liveTranslationLanguage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-lg text-blue-600">{liveTranslationLanguage} (Language Support)</h3>
                <Badge variant="outline" className="border-blue-200 text-blue-600">Translation</Badge>
              </div>
              <div className="prose prose-sm max-w-none bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm min-h-[400px]">
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {liveTranslatedContent}
                </div>
              </div>
              {/* EL support indicator */}
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <span>🌍 English Learner Support</span>
                <span>•</span>
                <span>🗣️ Multilingual accessibility</span>
              </div>
              {/* Read aloud for translated content */}
              <div className="mt-4">
                <InlineReadAloud 
                  text={liveTranslatedContent} 
                  language={liveTranslationLanguage?.toLowerCase() || 'auto'} 
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonContent;
