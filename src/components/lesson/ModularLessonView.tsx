import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SafeHtml from '@/components/ui/SafeHtml';
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
import InlineReadAloud from '@/components/InlineReadAloud';
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
  
  // Debug logging for lesson components
  console.log('ModularLessonView - lessonId:', lessonId);
  console.log('ModularLessonView - components:', components);
  console.log('ModularLessonView - isLoading:', isLoading);
  const { lesson, getContentForReadingLevel } = useLessonData(lessonId);
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
  
  // Get main lesson content based on reading level
  const mainLessonContent = React.useMemo(() => {
    return getContentForReadingLevel();
  }, [getContentForReadingLevel, preferences]);

  // Reading level options
  const readingLevelOptions = [
    { value: 'Grade 3', label: 'Grade 3' },
    { value: 'Grade 5', label: 'Grade 5' },
    { value: 'Grade 8', label: 'Grade 8' },
    { value: 'High School', label: 'High School' },
  ];

  // Helper functions (must be defined before useMemo that uses them)
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'main-content': return '📖';
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
      case 'main-content': return 'Lesson Content';
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

  // Format text content for proper display
  const formatTextContent = (text: string) => {
    if (!text) return '';
    
    return text
      // Convert line breaks to HTML line breaks
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      // Convert double line breaks to paragraph breaks
      .replace(/(<br>){2,}/g, '</p><p>')
      // Wrap in paragraph tags
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      // Convert emoji headers to proper headers
      .replace(/^<p>([🔍💡🛠️🔢🚀📌].*?)<\/p>/gm, '<h3>$1</h3>')
      // Make bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle table-like content
      .replace(/^<p>(Real-Life Scenario|How Excel Helps)<\/p>/gm, '<h4>$1</h4>');
  };

  // Combine main lesson content with lesson components
  const allTabs = React.useMemo(() => {
    const tabs = [];
    
    // Add main lesson content as first tab if it exists
    if (mainLessonContent) {
      tabs.push({
        id: 'main-content',
        type: 'main-content',
        title: lesson?.Title || 'Lesson Content',
        content: mainLessonContent
      });
    }
    
    // Add lesson components
    components.forEach(component => {
      tabs.push({
        id: component.id,
        type: component.component_type,
        title: getComponentDisplayName(component.component_type),
        component
      });
    });
    
    return tabs;
  }, [components, mainLessonContent, lesson]);

  // Set first tab as active when tabs load
  React.useEffect(() => {
    if (allTabs.length > 0 && !activeTab) {
      setActiveTab(allTabs[0].id);
    }
  }, [allTabs, activeTab]);

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

  if (allTabs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Content Available
          </h3>
          <p className="text-sm text-muted-foreground">
            This lesson doesn't have any content or components configured yet. 
            Contact your administrator to add lesson content.
          </p>
        </CardContent>
      </Card>
    );
  }

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

  // Map language names to ElevenLabs language codes
  const getLanguageCode = (languageName: string): string => {
    const languageMap: { [key: string]: string } = {
      'Spanish': 'es',
      'Somali': 'so',
      'Hmong': 'hmn',
      'Ojibwe': 'oj',
      'French': 'fr',
      'German': 'de',
      'Italian': 'it',
      'Portuguese': 'pt',
      'Russian': 'ru',
      'Japanese': 'ja',
      'Korean': 'ko',
      'Chinese (Simplified)': 'zh',
      'Arabic': 'ar',
    };
    return languageMap[languageName] || 'en';
  };

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
            {allTabs.length} {allTabs.length === 1 ? 'section' : 'sections'} available
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
               Make this easier to understand
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
          {allTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <span className="text-lg">
                {getComponentIcon(tab.type)}
              </span>
              <span className="truncate">
                {getComponentDisplayName(tab.type)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>


        {allTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            {tab.type === 'main-content' ? (
              translatedContent ? (
                // Side-by-side view for main content when translated
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Original Content */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getComponentIcon(tab.type)}
                          </span>
                          <div>
                            <h2 className="text-xl font-semibold">
                              {lesson?.Title || 'Lesson Content'}
                            </h2>
                            <Badge variant="outline" className="mt-1">English</Badge>
                          </div>
                        </div>
                      </div>
                      <InlineReadAloud text={formatTextContent(tab.content || '')} />
                    </CardContent>
                  </Card>

                  {/* Translated Content */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getComponentIcon(tab.type)}
                          </span>
                          <div>
                            <h2 className="text-xl font-semibold">
                              {lesson?.Title || 'Lesson Content'}
                            </h2>
                            <Badge variant="secondary" className="mt-1">
                              <Globe className="h-3 w-3 mr-1" />
                              {languageOptions.find(l => l.value === selectedLanguage)?.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                     <div className="space-y-4">
                       <SafeHtml 
                         html={translatedContent} 
                         className="prose max-w-none"
                       />
                      <InlineReadAloud 
                        text={translatedContent} 
                        language={getLanguageCode(selectedLanguage)}
                        className="mt-4"
                      />
                    </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Single view for main content when not translated
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getComponentIcon(tab.type)}
                        </span>
                         <div>
                           <h2 className="text-xl font-semibold">
                             {lesson?.Title || 'Lesson Content'}
                           </h2>
                         </div>
                      </div>
                    </div>
                    <InlineReadAloud text={formatTextContent(tab.content || '')} />
                  </CardContent>
                </Card>
              )
            ) : translatedContent ? (
              // Side-by-side view when translation is available (for components)
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Content */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getComponentIcon(tab.type)}
                        </span>
                        <div>
                          <h2 className="text-xl font-semibold">
                            {getComponentDisplayName(tab.type)}
                          </h2>
                          <Badge variant="outline" className="mt-1">English</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <LessonComponentRenderer component={tab.component} />
                      <InlineReadAloud 
                        text={tab.component?.content || tab.component?.description || ''} 
                        className="mt-4"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Translated Content */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getComponentIcon(tab.type)}
                        </span>
                        <div>
                          <h2 className="text-xl font-semibold">
                            {getComponentDisplayName(tab.type)}
                          </h2>
                          <Badge variant="secondary" className="mt-1">
                            <Globe className="h-3 w-3 mr-1" />
                            {languageOptions.find(l => l.value === selectedLanguage)?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <InlineReadAloud 
                      text={formatTextContent(translatedContent)} 
                      language={getLanguageCode(selectedLanguage)}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Single view when no translation (for components)
              <Card>
                <CardContent className="p-6">
                  {/* Component Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getComponentIcon(tab.type)}
                      </span>
                      <div>
                        <h2 className="text-xl font-semibold">
                          {getComponentDisplayName(tab.type)}
                        </h2>
                         <div className="flex gap-2 mt-1">
                           {tab.component?.language_code !== 'en' && (
                             <Badge variant="secondary">{tab.component?.language_code?.toUpperCase()}</Badge>
                           )}
                         </div>
                      </div>
                    </div>

                    {/* Component-specific controls */}
                    <div className="flex gap-2">
                    </div>
                  </div>

                  {/* Component Content */}
                  <div className="space-y-4">
                    <LessonComponentRenderer component={tab.component} />
                    <InlineReadAloud 
                      text={tab.component?.content || tab.component?.description || ''} 
                      className="mt-4"
                    />
                  </div>
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