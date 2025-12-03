import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GripVertical, Trash2, ChevronDown, ChevronUp, Plus, Volume2, Settings, Minus } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { LocalFileUpload } from './LocalFileUpload';
import { SlideTextExtractor } from './SlideTextExtractor';
import { QuizBuilderComponent } from '@/components/quiz/QuizBuilderComponent';
import { PollBuilderComponent } from '@/components/poll/PollBuilderComponent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiscussionEditor } from '@/components/lesson-components/DiscussionEditor';
import { DriveFilePicker } from '@/components/drive/DriveFilePicker';
import { DriveAttachmentsList } from '@/components/drive/DriveAttachmentsList';
import { OneDriveFilePicker, OneDriveAttachmentsList } from '@/components/onedrive';
import { useDriveAttachment } from '@/hooks/useDriveAttachment';
import { useOneDriveAttachment } from '@/hooks/useOneDriveAttachment';
import { FEATURE_FLAGS } from '@/config/features';

interface LessonComponent {
  id?: string;
  component_type: string;
  title?: string;
  content: any;
  order: number;
  enabled: boolean;
  is_assignable: boolean;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
}

interface SortableComponentCardProps {
  id: string;
  component: LessonComponent;
  index: number;
  onUpdate: (index: number, updates: Partial<LessonComponent>) => void;
  onDelete: (index: number) => void;
  lessonId?: string;
}

const componentTypeLabels: Record<string, string> = {
  slides: 'PowerPoint/Slides',
  page: 'Page',
  video: 'Multimedia',
  quiz: 'Quiz/Assessment',
  poll: 'Poll/Survey',
  discussion: 'Discussion',
  codingEditor: 'Coding IDE',
  desmos: 'Desmos Activity',
  activity: 'Activity',
  assignment: 'Assignment',
  assessment: 'Assessment',
  reflection: 'Reflection',
  instructions: 'Instructions',
  resources: 'Resources',
};

export function SortableComponentCard({
  id,
  component,
  index,
  onUpdate,
  onDelete,
  lessonId,
}: SortableComponentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isExpanded, setIsExpanded] = useState(true);
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);
  const [isPollBuilderOpen, setIsPollBuilderOpen] = useState(false);
  const { attachFile: attachDriveFile, isAttaching: isAttachingDrive } = useDriveAttachment();
  const { attachFile: attachOneDriveFile, isAttaching: isAttachingOneDrive } = useOneDriveAttachment();
  const canUseCloudAttachments = FEATURE_FLAGS.ENABLE_CLOUD_ATTACHMENTS;

  const handleContentChange = (field: string, value: any) => {
    onUpdate(index, {
      content: { ...component.content, [field]: value },
    });
  };

  const handleLocalFileUploaded = (file: { name: string; path: string; url: string }) => {
    console.log('📎 Local file uploaded:', file);
    const existingFiles = component.content.uploadedFiles || [];
    
    onUpdate(index, {
      content: {
        ...component.content,
        uploadedFiles: [...existingFiles, file],
      },
    });
  };

  const handleDriveFileSelected = (file: any) => {
    if (!component.id) {
      console.warn('No component id available for Drive attachment');
      return;
    }
    attachDriveFile({ componentId: component.id, file });
  };

  const handleOneDriveFileSelected = (file: any) => {
    if (!component.id) {
      console.warn('No component id available for OneDrive attachment');
      return;
    }
    attachOneDriveFile({ componentId: component.id, file });
  };

  const renderFields = () => {
    switch (component.component_type) {
      case 'slides':
        return (
          <>
            <div>
              <Label htmlFor={`${component.id}-title`}>Presentation Title</Label>
              <Input
                id={`${component.id}-title`}
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="e.g., Introduction to Cell Biology"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor={`${component.id}-url`}>Presentation Embed Link</Label>
              <Input
                id={`${component.id}-url`}
                value={component.content.url || ''}
                onChange={(e) => handleContentChange('url', e.target.value)}
                placeholder="https://docs.google.com/presentation/d/.../embed"
                className="font-mono text-sm"
              />
              
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-medium flex items-center gap-2">
                  📚 Supported Platforms
                </p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>✓ Google Slides (recommended)</li>
                  <li>✓ OneDrive PowerPoint Online</li>
                  <li>✓ Canva Presentations</li>
                  <li>✓ Prezi</li>
                  <li>✓ SlideShare</li>
                </ul>
              </div>

              <div className="border rounded-lg p-3 space-y-3 bg-card">
                <p className="text-sm font-medium text-primary">📋 How to Get an Embed Link:</p>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="font-medium mb-1">Google Slides:</p>
                    <ol className="text-muted-foreground space-y-0.5 ml-4 list-decimal text-xs">
                      <li>Open your presentation in Google Slides</li>
                      <li>Click <strong>File</strong> → <strong>Share</strong> → <strong>Publish to web</strong></li>
                      <li>Click the <strong>Embed</strong> tab</li>
                      <li>Copy the link and paste it above</li>
                    </ol>
                  </div>

                  <div className="text-sm pt-2 border-t">
                    <p className="font-medium mb-1">OneDrive PowerPoint:</p>
                    <ol className="text-muted-foreground space-y-0.5 ml-4 list-decimal text-xs">
                      <li>Open your PowerPoint in OneDrive (online)</li>
                      <li>Click <strong>File</strong> → <strong>Share</strong> → <strong>Embed</strong></li>
                      <li>Click <strong>Generate</strong> to create embed code</li>
                      <li>Copy the URL from the <code>src="..."</code> part of the iframe code</li>
                    </ol>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-2 border-t">
                  💡 Make sure your presentation is set to "Anyone with the link can view" in your sharing settings.
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor={`${component.id}-notes`}>Speaker Notes (optional)</Label>
              <Textarea
                id={`${component.id}-notes`}
                value={component.content.notes || ''}
                onChange={(e) => handleContentChange('notes', e.target.value)}
                placeholder="Additional context or talking points for students..."
                rows={3}
              />
            </div>

            {/* Accessibility Section - Slide Text Content */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-start gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Volume2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-base font-semibold">Accessibility Content (Optional)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add text content for each slide to enable Text-to-Speech and Translation features for students
                  </p>
                </div>
              </div>

              {/* AI Text Extraction */}
              <SlideTextExtractor 
                onTextsExtracted={(texts) => {
                  const newSlides = texts.map((text, index) => ({
                    text,
                    notes: component.content.slides?.[index]?.notes || ''
                  }));
                  handleContentChange('slides', newSlides);
                }}
              />

              <div className="space-y-3">
                {(component.content.slides || []).map((slide: any, slideIndex: number) => (
                  <div key={slideIndex} className="p-3 border rounded-lg bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Slide {slideIndex + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlides = [...(component.content.slides || [])];
                          newSlides.splice(slideIndex, 1);
                          handleContentChange('slides', newSlides);
                        }}
                        className="h-6 px-2 text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    <Textarea
                      value={slide.text || ''}
                      onChange={(e) => {
                        const newSlides = [...(component.content.slides || [])];
                        newSlides[slideIndex] = { ...newSlides[slideIndex], text: e.target.value };
                        handleContentChange('slides', newSlides);
                      }}
                      placeholder="Enter the text content from this slide..."
                      rows={3}
                      className="text-sm"
                    />
                    <Input
                      value={slide.notes || ''}
                      onChange={(e) => {
                        const newSlides = [...(component.content.slides || [])];
                        newSlides[slideIndex] = { ...newSlides[slideIndex], notes: e.target.value };
                        handleContentChange('slides', newSlides);
                      }}
                      placeholder="Optional notes for this slide"
                      className="text-sm"
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSlides = [...(component.content.slides || []), { text: '', notes: '' }];
                    handleContentChange('slides', newSlides);
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide Text
                </Button>

                {(!component.content.slides || component.content.slides.length === 0) && (
                  <p className="text-xs text-center text-muted-foreground py-2">
                    No slide text added yet. Add slide text to enable accessibility features.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${component.id}-downloads`}>Allow Downloads</Label>
                <input
                  type="checkbox"
                  id={`${component.id}-downloads`}
                  checked={component.content.allowDownloads !== false}
                  onChange={(e) => handleContentChange('allowDownloads', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor={`${component.id}-fullview`}>Require Full Viewing</Label>
                <input
                  type="checkbox"
                  id={`${component.id}-fullview`}
                  checked={component.content.requireFullViewing || false}
                  onChange={(e) => handleContentChange('requireFullViewing', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor={`${component.id}-thumbnails`}>Show Thumbnails</Label>
                <input
                  type="checkbox"
                  id={`${component.id}-thumbnails`}
                  checked={component.content.showThumbnails !== false}
                  onChange={(e) => handleContentChange('showThumbnails', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor={`${component.id}-translation`}>Enable Translation</Label>
                <input
                  type="checkbox"
                  id={`${component.id}-translation`}
                  checked={component.content.enableTranslation !== false}
                  onChange={(e) => handleContentChange('enableTranslation', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </>
        );

      case 'page':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Page title"
              />
            </div>
            <div>
              <Label>Content</Label>
              <RichTextEditor
                value={component.content.body || ''}
                onChange={(value) => handleContentChange('body', value)}
                placeholder="Enter page content with formatting, links, and images..."
              />
            </div>
          </>
        );

      case 'video':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Video title"
              />
            </div>
            <div>
              <Label>Video URL</Label>
              <Input
                value={component.content.url || ''}
                onChange={(e) => handleContentChange('url', e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <Label>Caption</Label>
              <Input
                value={component.content.caption || ''}
                onChange={(e) => handleContentChange('caption', e.target.value)}
                placeholder="Video description"
              />
            </div>
          </>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-50 border-2 border-cyan-900 rounded-lg">
              <p className="font-semibold text-cyan-900 mb-2">✅ Quiz Component</p>
              <p className="text-sm text-muted-foreground">
                Quiz content is managed through the dedicated Quiz Builder interface. 
                Click the "Configure Quiz" button below to add questions, set time limits, configure grading, and more.
              </p>
              {component.content?.quizData ? (
                <div className="mt-3 p-2 bg-green-50 border border-green-500 rounded text-sm text-green-800">
                  ✓ Quiz configured with {component.content.quizData.questions?.length || 0} question(s)
                </div>
              ) : (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-500 rounded text-sm text-yellow-800">
                  ⚠️ Quiz not configured yet
                </div>
              )}
            </div>
            <Button 
              onClick={() => setIsQuizBuilderOpen(true)}
              className="w-full"
              variant="default"
            >
              <Settings className="h-4 w-4 mr-2" />
              {component.content?.quizData ? 'Edit Quiz Configuration' : 'Configure Quiz'}
            </Button>
            <div>
              <Label>Quiz Title (optional override)</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="e.g., Chapter 3 Quiz"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`${component.id}-quiz-tts`} className="cursor-pointer">
                  Enable Text-to-Speech for questions
                </Label>
              </div>
              <input
                type="checkbox"
                id={`${component.id}-quiz-tts`}
                checked={component.content.enableTTS !== false}
                onChange={(e) => handleContentChange('enableTTS', e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <Dialog open={isQuizBuilderOpen} onOpenChange={setIsQuizBuilderOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Quiz Builder</DialogTitle>
                </DialogHeader>
                <QuizBuilderComponent
                  initialData={component.content?.quizData}
                  onSave={(quizData) => {
                    handleContentChange('quizData', quizData);
                    setIsQuizBuilderOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'poll':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border-2 border-purple-900 rounded-lg">
              <p className="font-semibold text-purple-900 mb-2">📊 Poll/Survey Component</p>
              <p className="text-sm text-muted-foreground">
                Create interactive polls and surveys for student engagement. 
                Click the "Configure Poll" button below to add questions and response options.
              </p>
              {component.content?.pollData ? (
                <div className="mt-3 p-2 bg-green-50 border border-green-500 rounded text-sm text-green-800">
                  ✓ Poll configured with {component.content.pollData.questions?.length || 0} question(s)
                </div>
              ) : (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-500 rounded text-sm text-yellow-800">
                  ⚠️ Poll not configured yet
                </div>
              )}
            </div>
            <Button 
              onClick={() => setIsPollBuilderOpen(true)}
              className="w-full"
              variant="default"
            >
              <Settings className="h-4 w-4 mr-2" />
              {component.content?.pollData ? 'Edit Poll Configuration' : 'Configure Poll'}
            </Button>
            <div>
              <Label>Poll Title (optional override)</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="e.g., Class Feedback Survey"
              />
            </div>

            <Dialog open={isPollBuilderOpen} onOpenChange={setIsPollBuilderOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Poll Builder</DialogTitle>
                </DialogHeader>
                <PollBuilderComponent
                  initialData={component.content?.pollData}
                  onSave={(pollData) => {
                    handleContentChange('pollData', pollData);
                    setIsPollBuilderOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'discussion':
        return (
          <DiscussionEditor
            content={component.content}
            onChange={(value) => onUpdate(index, { content: value })}
          />
        );

      case 'codingEditor':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Coding exercise title"
              />
            </div>
            <div>
              <Label>Programming Language</Label>
              <Select
                value={component.content.language || 'python'}
                onValueChange={(value) => handleContentChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Starter Code</Label>
              <Textarea
                value={component.content.starterCode || ''}
                onChange={(e) => handleContentChange('starterCode', e.target.value)}
                placeholder="# Enter starter code here..."
                rows={6}
                className="font-mono"
              />
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea
                value={component.content.instructions || ''}
                onChange={(e) => handleContentChange('instructions', e.target.value)}
                placeholder="Instructions for the coding exercise..."
                rows={3}
              />
            </div>
          </>
        );

      case 'desmos':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Desmos activity title"
              />
            </div>
            <div>
              <Label>Desmos Activity URL or Embed Code</Label>
              <Input
                value={component.content.url || ''}
                onChange={(e) => handleContentChange('url', e.target.value)}
                placeholder="https://teacher.desmos.com/activitybuilder/..."
              />
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea
                value={component.content.instructions || ''}
                onChange={(e) => handleContentChange('instructions', e.target.value)}
                placeholder="Instructions for students..."
                rows={3}
              />
            </div>
          </>
        );

      case 'activity':
        return (
          <>
            <div>
              <Label>Activity Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Activity title"
              />
            </div>
            <div>
              <Label>Activity Type</Label>
              <Select
                value={component.content.activityType || 'individual'}
                onValueChange={(value) => handleContentChange('activityType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Work</SelectItem>
                  <SelectItem value="pairs">Pair Work</SelectItem>
                  <SelectItem value="group">Group Activity</SelectItem>
                  <SelectItem value="class">Whole Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Instructions</Label>
              <RichTextEditor
                value={component.content.instructions || ''}
                onChange={(value) => handleContentChange('instructions', value)}
                placeholder="Enter activity instructions..."
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={component.content.duration || ''}
                onChange={(e) => handleContentChange('duration', parseInt(e.target.value) || '')}
                placeholder="10"
              />
            </div>
            <div>
              <Label>Materials Needed</Label>
              <Textarea
                value={component.content.materials || ''}
                onChange={(e) => handleContentChange('materials', e.target.value)}
                placeholder="List any materials students will need..."
                rows={2}
              />
            </div>
          </>
        );

      case 'assignment':
        return (
          <>
            <div>
              <Label>Assignment Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Assignment title"
              />
            </div>
            <div>
              <Label>Instructions</Label>
              <RichTextEditor
                value={component.content.instructions || ''}
                onChange={(value) => handleContentChange('instructions', value)}
                placeholder="Enter assignment instructions..."
              />
            </div>
            <div>
              <Label>Rubric/Grading Criteria (optional)</Label>
              <Textarea
                value={component.content.rubric || ''}
                onChange={(e) => handleContentChange('rubric', e.target.value)}
                placeholder="Describe how the assignment will be graded..."
                rows={4}
              />
            </div>
            <div>
              <Label>Points Possible</Label>
              <Input
                type="number"
                value={component.content.points || ''}
                onChange={(e) => handleContentChange('points', parseInt(e.target.value) || '')}
                placeholder="100"
              />
            </div>
          </>
        );

      case 'reflection':
        return (
          <>
            <div>
              <Label>Reflection Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Reflection title"
              />
            </div>
            <div>
              <Label>Reflection Prompts</Label>
              <RichTextEditor
                value={component.content.prompts || ''}
                onChange={(value) => handleContentChange('prompts', value)}
                placeholder="Enter reflection questions or prompts for students..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor={`${component.id}-private`}>Private Reflections (only teacher can see)</Label>
              <input
                type="checkbox"
                id={`${component.id}-private`}
                checked={component.content.isPrivate || false}
                onChange={(e) => handleContentChange('isPrivate', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </>
        );

      case 'instructions':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Instructions section title"
              />
            </div>
            <div>
              <Label>Instructions Content</Label>
              <RichTextEditor
                value={component.content.body || ''}
                onChange={(value) => handleContentChange('body', value)}
                placeholder="Enter clear instructions for students..."
              />
            </div>
          </>
        );

      case 'resources':
        return (
          <>
            <div>
              <Label>Resources Section Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Additional Resources"
              />
            </div>
            <div>
              <Label>Resource Links & Descriptions</Label>
              <RichTextEditor
                value={component.content.body || ''}
                onChange={(value) => handleContentChange('body', value)}
                placeholder="Add links to external resources, videos, websites..."
              />
            </div>
          </>
        );

      case 'flashcards':
        return (
          <>
            <div>
              <Label>Flashcard Set Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="e.g., Vocabulary Chapter 5"
              />
            </div>
            <div className="space-y-3">
              <Label>Flashcards</Label>
              {(component.content.cards || []).map((card: any, cardIndex: number) => (
                <div key={cardIndex} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Card {cardIndex + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newCards = [...(component.content.cards || [])];
                        newCards.splice(cardIndex, 1);
                        handleContentChange('cards', newCards);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={card.front || ''}
                    onChange={(e) => {
                      const newCards = [...(component.content.cards || [])];
                      newCards[cardIndex] = { ...newCards[cardIndex], front: e.target.value };
                      handleContentChange('cards', newCards);
                    }}
                    placeholder="Front (term/question)"
                  />
                  <Input
                    value={card.back || ''}
                    onChange={(e) => {
                      const newCards = [...(component.content.cards || [])];
                      newCards[cardIndex] = { ...newCards[cardIndex], back: e.target.value };
                      handleContentChange('cards', newCards);
                    }}
                    placeholder="Back (definition/answer)"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newCards = [...(component.content.cards || []), { front: '', back: '' }];
                  handleContentChange('cards', newCards);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          </>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Component title"
              />
            </div>
            <div>
              <Label>Content (JSON)</Label>
              <Textarea
                value={JSON.stringify(component.content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onUpdate(index, { content: parsed });
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={6}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`transition-all ${isDragging ? 'shadow-lg opacity-50 rotate-2' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing hover:bg-accent p-2 rounded-md transition-colors group"
                title="Drag to reorder"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="text-base">
                {componentTypeLabels[component.component_type] || component.component_type}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8"
                aria-label={isExpanded ? "Collapse component" : "Expand component"}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">Expand</span>
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(index)}
                className="h-8 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {renderFields()}

            <Separator className="my-4" />

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`assignable-${index}`}
                checked={component.is_assignable || false}
                onCheckedChange={(checked) => onUpdate(index, { is_assignable: checked as boolean })}
              />
              <label
                htmlFor={`assignable-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as Assignable (appears in Assignments tab)
              </label>
            </div>

            <Separator className="my-4" />

            {/* File Attachments - Hidden for slides component since it uses embed links only */}
            {component.component_type !== 'slides' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">File Attachments</Label>
                </div>

                {component.component_type === 'assignment' && (
                  <div>
                    <Label>Submission Link (Optional)</Label>
                    <Input
                      type="url"
                      value={component.content.submissionLink || ''}
                      onChange={(e) => handleContentChange('submissionLink', e.target.value)}
                      placeholder="https://forms.google.com/... or other submission URL"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add a link where students can submit their work (e.g., Google Form, external platform)
                    </p>
                  </div>
                )}

                {canUseCloudAttachments && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Cloud Storage</Label>
                    <div className="flex flex-wrap gap-2">
                      <DriveFilePicker
                        onFileSelected={handleDriveFileSelected}
                        disabled={!component.id || isAttachingDrive}
                        variant="outline"
                        size="sm"
                      />
                      <OneDriveFilePicker
                        onFileSelected={handleOneDriveFileSelected}
                        disabled={!component.id || isAttachingOneDrive}
                      />
                    </div>
                    {!component.id && (
                      <p className="text-xs text-muted-foreground">
                        Save this component to enable cloud attachments.
                      </p>
                    )}
                    {component.id && (
                      <div className="space-y-2">
                        <DriveAttachmentsList
                          componentId={component.id}
                          showEmbeds={false}
                          canDelete={true}
                        />
                        <OneDriveAttachmentsList
                          componentId={component.id}
                          showEmbeds={false}
                          canDelete={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                <LocalFileUpload onFileUploaded={handleLocalFileUploaded} variant="outline" size="sm" />

                {component.content.uploadedFiles && component.content.uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Uploaded Files:</Label>
                    <ul className="text-sm space-y-1">
                      {component.content.uploadedFiles.map((file: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-primary">📎</span>
                          <span>{file.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
