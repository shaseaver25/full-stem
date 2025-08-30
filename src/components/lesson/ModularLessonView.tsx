import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Book, Globe, Languages, Loader2 } from 'lucide-react';
import { useLessonComponents } from '@/hooks/useLessonComponents';
import { useLessonData } from '@/hooks/useLessonData';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import LessonComponentRenderer from './LessonComponentRenderer';
import DesmosSection from './DesmosSection';

interface ModularLessonViewProps {
  lessonId: string;
  lessonTitle: string;
  fullLessonText: string;
}

const ModularLessonView: React.FC<ModularLessonViewProps> = ({
  lessonId,
  lessonTitle,
  fullLessonText
}) => {
  const { data: components = [], isLoading } = useLessonComponents(lessonId);
  const { lesson } = useLessonData(lessonId);
  const { translateText, isTranslating } = useLiveTranslation();
  const { preferences, savePreferences } = useUserPreferences();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('');
  const [isTranslateMenuOpen, setIsTranslateMenuOpen] = useState(false);
  const [isReadingLevelMenuOpen, setIsReadingLevelMenuOpen] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  // Get user's reading level preference
  const userReadingLevel = preferences?.['Reading Level'] || 'Grade 5';

  // Reading level options
  const readingLevelOptions = [
    { value: 'Grade 3', label: 'Grade 3' },
    { value: 'Grade 5', label: 'Grade 5' },
    { value: 'Grade 8', label: 'Grade 8' },
    { value: 'High School', label: 'High School' },
  ];

  // Set first component as active when components load
  React.useEffect(() => {
    if (components.length > 0 && !activeTab) {
      setActiveTab(components[0].id);
    }
  }, [components, activeTab]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsTranslateMenuOpen(false);
        setIsReadingLevelMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Components Configured
          </h3>
          <p className="text-sm text-muted-foreground">
            This lesson hasn't been configured with modular components yet. 
            Contact your administrator to set up lesson components.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'instructions': return '📋';
      case 'assignment': return '📝';
      case 'activity': return '🎯';
      case 'resources': return '📚';
      case 'discussion': return '💬';
      case 'reflection': return '🤔';
      case 'formativeCheck': return '✅';
      case 'rubric': return '📊';
      case 'codingEditor': return '💻';
      case 'aiAssistant': return '🤖';
      case 'peerReview': return '👥';
      case 'checklist': return '☑️';
      case 'liveDemo': return '🎬';
      default: return '📄';
    }
  };

  const getComponentDisplayName = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'instructions': return 'Instructions';
      case 'assignment': return 'Assignment';
      case 'activity': return 'Activity';
      case 'resources': return 'Resources';
      case 'discussion': return 'Discussion';
      case 'reflection': return 'Reflection';
      case 'formativeCheck': return 'Quick Check';
      case 'rubric': return 'Rubric';
      case 'codingEditor': return 'Code Editor';
      case 'aiAssistant': return 'AI Assistant';
      case 'peerReview': return 'Peer Review';
      case 'checklist': return 'Checklist';
      case 'liveDemo': return 'Live Demo';
      default: return type;
    }
  };

  // Language options for translation
  const languageOptions = [
    { value: 'Spanish', label: 'Spanish' },
    { value: 'Somali', label: 'Somali' },
    { value: 'Hmong', label: 'Hmong' },
    { value: 'Ojibwe', label: 'Ojibwe' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Chinese (Simplified)', label: 'Chinese' },
    { value: 'Arabic', label: 'Arabic' },
  ];

  // Handle translation
  const handleTranslate = async (targetLanguage: string) => {
    if (!fullLessonText) {
      toast({
        title: "No Content",
        description: "No lesson content available to translate.",
        variant: "destructive",
      });
      return;
    }

    const result = await translateText({
      text: fullLessonText,
      targetLanguage: targetLanguage,
      sourceLanguage: 'en'
    });

    if (result) {
      setTranslatedContent(result);
      setSelectedLanguage(targetLanguage);
      setIsTranslateMenuOpen(false);
      toast({
        title: "Translation Complete",
        description: `Lesson translated to ${languageOptions.find(l => l.value === targetLanguage)?.label}`,
      });
    }
  };

  // Clear translation
  const clearTranslation = () => {
    setTranslatedContent(null);
    setSelectedLanguage('');
    toast({
      title: "Translation Cleared",
      description: "Showing original lesson content.",
    });
  };

  // Handle reading level change
  const handleReadingLevelChange = async (newLevel: string) => {
    if (!savePreferences) return;

    const success = await savePreferences({
      'Preferred Language': preferences?.['Preferred Language'] || null,
      'Enable Translation View': preferences?.['Enable Translation View'] || null,
      'Enable Read-Aloud': preferences?.['Enable Read-Aloud'] || null,
      'Reading Level': newLevel,
      'Text Speed': preferences?.['Text Speed'] || null,
    });

    if (success) {
      setIsReadingLevelMenuOpen(false);
      toast({
        title: "Reading Level Updated",
        description: `Reading level changed to ${newLevel}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with global controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <h1 className="text-2xl font-bold">{lessonTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {components.length} components available
          </p>
        </div>
        <div className="flex gap-2">
          {/* Translation Controls */}
          {!translatedContent ? (
            <div className="relative" data-dropdown>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsTranslateMenuOpen(!isTranslateMenuOpen)}
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4 mr-2" />
                )}
                Translate
              </Button>
              
              {isTranslateMenuOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-2 min-w-[200px]">
                  <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Select Language:</p>
                  <div className="space-y-1">
                    {languageOptions.map((lang) => (
                      <Button
                        key={lang.value}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleTranslate(lang.value)}
                        disabled={isTranslating}
                      >
                        <Languages className="h-4 w-4 mr-2" />
                        {lang.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {languageOptions.find(l => l.value === selectedLanguage)?.label}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearTranslation}
              >
                Clear Translation
              </Button>
            </div>
          )}
          
          {/* Reading Level Controls */}
          <div className="relative" data-dropdown>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsReadingLevelMenuOpen(!isReadingLevelMenuOpen)}
            >
              <Book className="h-4 w-4 mr-2" />
              {userReadingLevel}
            </Button>
            
              {isReadingLevelMenuOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-2 min-w-[150px]">
                  <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Reading Level:</p>
                  <div className="space-y-1">
                    {readingLevelOptions.map((level) => (
                      <Button
                        key={level.value}
                        variant={userReadingLevel === level.value ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleReadingLevelChange(level.value)}
                      >
                        <Book className="h-4 w-4 mr-2" />
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Tabbed Component View */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
          {components.map((component) => (
            <TabsTrigger
              key={component.id}
              value={component.id}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <span className="text-lg">
                {getComponentIcon(component.component_type)}
              </span>
              <span className="truncate">
                {getComponentDisplayName(component.component_type)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>


        {components.map((component) => (
          <TabsContent key={component.id} value={component.id} className="mt-6">
            {translatedContent ? (
              // Side-by-side view when translation is available
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Content */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getComponentIcon(component.component_type)}
                        </span>
                        <div>
                          <h2 className="text-xl font-semibold">
                            {getComponentDisplayName(component.component_type)}
                          </h2>
                          <Badge variant="outline" className="mt-1">English</Badge>
                        </div>
                      </div>
                    </div>
                    <LessonComponentRenderer component={component} />
                  </CardContent>
                </Card>

                {/* Translated Content */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getComponentIcon(component.component_type)}
                        </span>
                        <div>
                          <h2 className="text-xl font-semibold">
                            {getComponentDisplayName(component.component_type)}
                          </h2>
                          <Badge variant="secondary" className="mt-1">
                            <Globe className="h-3 w-3 mr-1" />
                            {languageOptions.find(l => l.value === selectedLanguage)?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: translatedContent }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Single view when no translation
              <Card>
                <CardContent className="p-6">
                  {/* Component Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getComponentIcon(component.component_type)}
                      </span>
                      <div>
                        <h2 className="text-xl font-semibold">
                          {getComponentDisplayName(component.component_type)}
                        </h2>
                        <div className="flex gap-2 mt-1">
                          {component.language_code !== 'en' && (
                            <Badge variant="secondary">{component.language_code.toUpperCase()}</Badge>
                          )}
                          <Badge variant="outline">{userReadingLevel} Reading Level</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Component-specific controls */}
                    <div className="flex gap-2">
                    </div>
                  </div>

                  {/* Component Content */}
                  <LessonComponentRenderer component={component} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Desmos Tool Section */}
      {lesson?.desmos_enabled && lesson?.desmos_type && (
        <DesmosSection desmosType={lesson.desmos_type} />
      )}
    </div>
  );
};

export default ModularLessonView;