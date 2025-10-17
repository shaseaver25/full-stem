
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
        <div className={liveTranslatedContent ? "grid grid-cols-2 gap-6" : "space-y-4"}>
          {/* English Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-lg text-primary">English</h3>
              <Badge variant="secondary">Original</Badge>
            </div>
            <div className="bg-background p-6 rounded-lg border shadow-sm min-h-[400px]">
              <SafeHtml 
                html={lessonContent}
                className="prose prose-sm max-w-none text-foreground"
              />
            </div>
          </div>

          {/* Translated Content - only shown when available */}
          {liveTranslatedContent && liveTranslationLanguage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-lg text-primary">{liveTranslationLanguage}</h3>
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  Translation
                </Badge>
              </div>
              <div className="bg-background p-6 rounded-lg border shadow-sm min-h-[400px]">
                <SafeHtml 
                  html={liveTranslatedContent}
                  className="prose prose-sm max-w-none text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* Accessibility features */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
          <span>📖 Screen reader compatible</span>
          <span>•</span>
          <span>🎯 IEP/504 accommodations supported</span>
          {liveTranslatedContent && (
            <>
              <span>•</span>
              <span>🌍 Multilingual accessibility</span>
            </>
          )}
        </div>

        {/* Read aloud buttons */}
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowReadAloud(!showReadAloud)}
            className="gap-2"
          >
            <Volume2 className="h-4 w-4" />
            {showReadAloud ? 'Hide' : 'Show'} English Read Aloud
          </Button>
          
          {liveTranslatedContent && liveTranslationLanguage && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTranslatedReadAloud(!showTranslatedReadAloud)}
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" />
              {showTranslatedReadAloud ? 'Hide' : 'Show'} {liveTranslationLanguage} Read Aloud
            </Button>
          )}
        </div>

        {/* Read aloud integration - English */}
        {showReadAloud && (
          <div className="mt-4">
            <InlineReadAloud 
              text={lessonContent} 
              language="en" 
            />
          </div>
        )}

        {/* Read aloud integration - Translated */}
        {showTranslatedReadAloud && liveTranslatedContent && liveTranslationLanguage && (
          <div className="mt-4">
            <InlineReadAloud 
              text={liveTranslatedContent} 
              language={liveTranslationLanguage.toLowerCase()} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonContent;
