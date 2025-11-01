import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InlineReadAloud from '@/components/InlineReadAloud';
import { LessonComponent } from '@/hooks/useLessonComponents';
import { FileText, Video, Code, MessageSquare, CheckSquare, Volume2, Languages, CheckCircle2 } from 'lucide-react';
import { DiscussionComponent } from './DiscussionComponent';
import { PresentationViewer } from './PresentationViewer';
import { usePresentationTTS } from '@/hooks/usePresentationTTS';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import { HighlightedText } from './HighlightedText';
import { DriveAttachmentsList } from '@/components/drive/DriveAttachmentsList';
import { OneDriveAttachmentsList } from '@/components/onedrive/OneDriveAttachmentsList';
import { QuizStudentView } from '@/components/quiz/QuizStudentView';
import { PollStudentView } from '@/components/poll/PollStudentView';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'hi', name: 'Hindi' },
  { code: 'it', name: 'Italian' },
];

interface LessonComponentRendererProps {
  component: LessonComponent;
  showTypeLabel?: boolean;
  lessonId?: string;
  lessonTitle?: string;
  lessonContent?: string;
  isTeacher?: boolean;
}

const componentTypeLabels: Record<string, string> = {
  slides: 'PowerPoint/Slides',
  page: 'Page',
  video: 'Multimedia',
  quiz: 'Quiz/Assessment',
  poll: 'Poll/Survey',
  discussion: 'Discussion',
  codingEditor: 'Coding IDE',
  activity: 'Activity',
  assignment: 'Assignment',
  reflection: 'Reflection',
  instructions: 'Instructions',
  resources: 'Resources',
};

// Separate component for video with controls to use hooks
function VideoComponentWithControls({ 
  content, 
  read_aloud, 
  language_code, 
  textContent,
  showTypeLabel 
}: { 
  content: any; 
  read_aloud?: boolean; 
  language_code?: string; 
  textContent: string;
  showTypeLabel: boolean;
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedCaption, setTranslatedCaption] = useState<string>('');
  const { speak, pause, resume, stop, isPlaying, isPaused, isLoading: isSpeaking, currentWordIndex, wordTimings } = usePresentationTTS();
  const { translateText, isTranslating } = useLiveTranslation();

  let videoUrl = content.url;
  
  // Convert YouTube URLs to embed format
  if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
    const youtubeIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeIdMatch && youtubeIdMatch[1]) {
      videoUrl = `https://www.youtube.com/embed/${youtubeIdMatch[1]}`;
    }
  }

  const handleReadAloud = async () => {
    const textToRead = selectedLanguage !== 'en' && translatedCaption
      ? translatedCaption
      : content.caption;
    
    if (textToRead) {
      await speak(textToRead);
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    
    if (langCode === 'en') {
      setTranslatedCaption('');
      return;
    }

    if (content.caption) {
      const languageName = SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name || langCode;
      const translated = await translateText({
        text: content.caption,
        targetLanguage: languageName,
        sourceLanguage: 'auto'
      });
      if (translated) {
        setTranslatedCaption(translated);
      }
    }
  };

  const displayCaption = selectedLanguage !== 'en' && translatedCaption
    ? translatedCaption
    : content.caption;

  return (
    <div className="space-y-4">
      {showTypeLabel && (
        <Badge variant="outline" className="mb-3">
          <Video className="w-3 h-3 mr-1" />
          {componentTypeLabels['video'] || 'Multimedia'}
        </Badge>
      )}
      {content.title && <h3 className="text-lg font-semibold mb-3">{content.title}</h3>}
      
      {videoUrl && (
        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg bg-muted">
          <iframe
            src={videoUrl}
            className="w-full h-full"
            title={content.title || 'Video content'}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {content.caption && (
        <>
          {/* Translation & Read Aloud Controls */}
          <div className="flex items-center justify-between gap-3 p-3 border rounded-lg bg-card">
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReadAloud}
                  disabled={isSpeaking}
                  aria-label="Read description aloud"
                  title="Read description aloud"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Read Aloud
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isPaused ? resume : pause}
                    aria-label={isPaused ? "Resume reading" : "Pause reading"}
                  >
                    {isPaused ? (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        Resume
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stop}
                    aria-label="Stop reading"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  </Button>
                </div>
              )}
            </div>

            <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
              <SelectTrigger 
                className="w-40" 
                aria-label={`Select language. Currently ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}`}
              >
                <Languages className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description with highlighting */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Description</h4>
              {selectedLanguage !== 'en' && (
                <Badge variant="secondary" className="text-xs">
                  {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed">
              <HighlightedText 
                text={displayCaption} 
                currentWordIndex={currentWordIndex}
                wordTimings={wordTimings}
              />
            </p>
          </div>
        </>
      )}

      {read_aloud && textContent && !content.caption && (
        <div className="mt-4 pt-4 border-t">
          <InlineReadAloud text={textContent.replace(/<[^>]*>/g, '')} language={language_code || 'en'} />
        </div>
      )}
    </div>
  );
}

export function LessonComponentRenderer({ 
  component, 
  showTypeLabel = true,
  lessonId,
  lessonTitle,
  lessonContent,
  isTeacher = false
}: LessonComponentRendererProps) {
  const { content, component_type, read_aloud, language_code, id } = component;
  const textContent = content.body || content.text || content.prompt || '';

  // Render special discussion component with AI features
  if (component_type === 'discussion' && lessonId && lessonTitle) {
    return (
      <DiscussionComponent
        componentId={id}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        lessonContent={lessonContent}
        isTeacher={isTeacher}
      />
    );
  }

  // Render presentation viewer with enhanced features (shareable links only)
  if (component_type === 'slides') {
    // Extract URL from iframe tag if necessary
    let embedUrl = content.url;
    if (embedUrl && embedUrl.includes('<iframe')) {
      const srcMatch = embedUrl.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        embedUrl = srcMatch[1];
      }
    }
    
    return (
      <div className="space-y-4">
        {showTypeLabel && (
          <Badge variant="outline">
            {componentTypeLabels[component_type] || component_type}
          </Badge>
        )}
        <PresentationViewer
          title={content.title}
          embedUrl={embedUrl}
          slides={content.slides}
          speakerNotes={content.notes}
          allowDownloads={content.allowDownloads !== false}
          requireFullViewing={content.requireFullViewing || false}
          showThumbnails={content.showThumbnails !== false}
          enableTranslation={content.enableTranslation !== false}
        />
      </div>
    );
  }

  // Render video/multimedia component with translation and TTS
  if (component_type === 'video' || component_type === 'multimedia') {
    return <VideoComponentWithControls content={content} read_aloud={read_aloud} language_code={language_code} textContent={textContent} showTypeLabel={showTypeLabel} />;
  }

  // Render quiz component
  if (component_type === 'quiz') {
    return <QuizStudentView componentId={id} read_aloud={read_aloud} quizData={content?.quizData} />;
  }

  // Render poll component
  if (component_type === 'poll') {
    return <PollStudentView componentId={id} />;
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      {showTypeLabel && (
        <Badge variant="outline" className="mb-3">
          {componentTypeLabels[component_type] || component_type}
        </Badge>
      )}
      {content.title && <h3 className="text-lg font-semibold mb-3">{content.title}</h3>}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {content.body && <div dangerouslySetInnerHTML={{ __html: content.body }} />}
        {content.text && <p>{content.text}</p>}
        {content.prompt && <p className="italic">{content.prompt}</p>}
      </div>
      {read_aloud && textContent && (
        <div className="mt-4 pt-4 border-t">
          <InlineReadAloud text={textContent.replace(/<[^>]*>/g, '')} language={language_code || 'en'} />
        </div>
      )}
      {id && component_type !== 'video' && component_type !== 'multimedia' && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <DriveAttachmentsList
            componentId={id}
            showEmbeds={true}
            canDelete={false}
          />
          <OneDriveAttachmentsList
            componentId={id}
            showEmbeds={true}
            canDelete={false}
          />
        </div>
      )}
    </div>
  );
}
