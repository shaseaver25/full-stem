
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Globe, Volume2 } from 'lucide-react';
import AdaptiveContentBox from './AdaptiveContentBox';
import InlineReadAloud from '@/components/InlineReadAloud';
import SafeHtml from '@/components/ui/SafeHtml';

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
  const [showReadAloud, setShowReadAloud] = useState(false);
  const [showTranslatedReadAloud, setShowTranslatedReadAloud] = useState(false);

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
            <div className="bg-background p-6 rounded-lg border shadow-sm min-h-[400px]">
              <SafeHtml 
                html={lessonContent}
                className="prose prose-sm max-w-none text-foreground"
              />
            </div>
            {/* Accessibility features */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>📖 Screen reader compatible</span>
              <span>•</span>
              <span>🎯 IEP/504 accommodations supported</span>
            </div>
            {/* Read aloud button */}
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReadAloud(!showReadAloud)}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                {showReadAloud ? 'Hide' : 'Show'} Read Aloud
              </Button>
            </div>
            {/* Read aloud integration - only shown when activated */}
            {showReadAloud && (
              <div className="mt-4">
                <InlineReadAloud text={lessonContent} language="en" />
              </div>
            )}
          </div>

          {/* Translated content pane - only shown when translation is available */}
          {liveTranslatedContent && liveTranslationLanguage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-lg text-blue-600">{liveTranslationLanguage} (Language Support)</h3>
                <Badge variant="outline" className="border-blue-200 text-blue-600">Translation</Badge>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm min-h-[400px]">
                <SafeHtml 
                  html={liveTranslatedContent}
                  className="prose prose-sm max-w-none text-gray-800"
                />
              </div>
              {/* EL support indicator */}
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <span>🌍 English Learner Support</span>
                <span>•</span>
                <span>🗣️ Multilingual accessibility</span>
              </div>
              {/* Read aloud button for translated content */}
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowTranslatedReadAloud(!showTranslatedReadAloud)}
                  className="gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  {showTranslatedReadAloud ? 'Hide' : 'Show'} Read Aloud
                </Button>
              </div>
              {/* Read aloud for translated content - only shown when activated */}
              {showTranslatedReadAloud && (
                <div className="mt-4">
                  <InlineReadAloud 
                    text={liveTranslatedContent} 
                    language={liveTranslationLanguage?.toLowerCase() || 'auto'} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonContent;
