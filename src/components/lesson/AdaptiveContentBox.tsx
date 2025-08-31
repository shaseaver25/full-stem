
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, BookOpen } from 'lucide-react';
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
  const enableReadAloud = false; // Removed - using global enhanced read aloud
  const userReadingLevel = preferences?.['Reading Level'] || 'Grade 5';
  const preferredLanguage = preferences?.['Preferred Language'];

  const shouldShowTranslation = enableTranslation && translatedContent && preferredLanguage;
  
  // Create comprehensive text for read-aloud including title and content
  const fullContentText = `${lessonTitle}. ${content}`;
  const fullTranslatedText = translatedContent ? `${lessonTitle}. ${translatedContent}` : '';

  console.log('AdaptiveContentBox - Enable translation:', enableTranslation);
  console.log('AdaptiveContentBox - Translated content:', translatedContent);
  console.log('AdaptiveContentBox - Should show translation:', shouldShowTranslation);
  console.log('AdaptiveContentBox - Preferred language:', preferredLanguage);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Personalized Lesson Content
          </CardTitle>
           <div className="flex items-center gap-2 flex-wrap">
             {enableTranslation && preferredLanguage && (
               <Badge variant="outline" className="text-xs">
                 {translatedContent ? 'Translation Available' : 'Translation Enabled'}
               </Badge>
             )}
           </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {shouldShowTranslation ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
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
              <div className="flex items-center gap-2 flex-wrap">
                <Globe className="h-4 w-4" />
                <h3 className="font-semibold text-sm">{preferredLanguage}</h3>
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
          <div className="space-y-4">
            <div className="prose prose-lg max-w-none bg-white p-6 rounded-lg border shadow-sm">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-800 text-lg">
                {content}
              </p>
            </div>
            {enableTranslation && preferredLanguage && !translatedContent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <Globe className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Translation Not Available</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Translation to {preferredLanguage} is not available for this lesson yet.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptiveContentBox;
