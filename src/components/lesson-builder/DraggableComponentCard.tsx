import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { OneDriveFilePicker } from '@/components/onedrive/OneDriveFilePicker';
import { OneDriveAttachmentsList } from '@/components/onedrive/OneDriveAttachmentsList';
import { useOneDriveAttachment } from '@/hooks/useOneDriveAttachment';
import { DriveFilePicker } from '@/components/drive/DriveFilePicker';
import { DriveAttachmentsList } from '@/components/drive/DriveAttachmentsList';
import { useDriveAttachment } from '@/hooks/useDriveAttachment';
import { LocalFileUpload } from './LocalFileUpload';

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

interface DraggableComponentCardProps {
  component: LessonComponent;
  index: number;
  onUpdate: (index: number, updates: Partial<LessonComponent>) => void;
  onDelete: (index: number) => void;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  isDragging: boolean;
}

const componentTypeLabels: Record<string, string> = {
  slides: 'PowerPoint/Slides',
  page: 'Page',
  video: 'Multimedia',
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

export function DraggableComponentCard({
  component,
  index,
  onUpdate,
  onDelete,
  dragHandleProps,
  isDragging,
}: DraggableComponentCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { attachFile, isAttaching } = useDriveAttachment();
  const { attachFile: attachOneDriveFile, isAttaching: isAttachingOneDrive } = useOneDriveAttachment();

  const handleContentChange = (field: string, value: any) => {
    onUpdate(index, {
      content: { ...component.content, [field]: value },
    });
  };

  const handleDriveFileSelected = (file: { id: string; name: string; mimeType: string; url: string }) => {
    if (!component.id) {
      console.error('❌ Component ID is required to attach files');
      return;
    }
    attachFile({ componentId: component.id, file });
  };

  const handleOneDriveFileSelected = (file: { id: string; name: string; mimeType: string; webUrl: string }) => {
    if (!component.id) {
      console.error('❌ Component ID is required to attach files');
      return;
    }
    attachOneDriveFile({ componentId: component.id, file });
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

  const renderFields = () => {
    switch (component.component_type) {
      case 'slides':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Slide deck title"
              />
            </div>
            <div>
              <Label>Embed URL or Upload</Label>
              <Input
                value={component.content.url || ''}
                onChange={(e) => handleContentChange('url', e.target.value)}
                placeholder="https://..."
              />
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

      case 'discussion':
        return (
          <>
            <div>
              <Label>Discussion Prompt</Label>
              <Textarea
                value={component.content.prompt || ''}
                onChange={(e) => handleContentChange('prompt', e.target.value)}
                placeholder="What question should students discuss?"
                rows={3}
              />
            </div>
            <div>
              <Label>Resources (optional)</Label>
              <Input
                value={component.content.resources || ''}
                onChange={(e) => handleContentChange('resources', e.target.value)}
                placeholder="Links or references"
              />
            </div>
          </>
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
              <Label>IDE Embed URL or Code</Label>
              <Textarea
                value={component.content.code || ''}
                onChange={(e) => handleContentChange('code', e.target.value)}
                placeholder="Replit URL, CodeSandbox URL, or starter code"
                rows={4}
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
                placeholder="Activity name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={component.content.description || ''}
                onChange={(e) => handleContentChange('description', e.target.value)}
                placeholder="What will students do?"
                rows={3}
              />
            </div>
            <div>
              <Label>Resources</Label>
              <Input
                value={component.content.resources || ''}
                onChange={(e) => handleContentChange('resources', e.target.value)}
                placeholder="Materials or links"
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
                placeholder="Assignment name"
              />
            </div>
            <div>
              <Label>Points</Label>
              <Input
                type="number"
                value={component.content.points || ''}
                onChange={(e) => handleContentChange('points', e.target.value)}
                placeholder="100"
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={component.content.dueDate || ''}
                onChange={(e) => handleContentChange('dueDate', e.target.value)}
              />
            </div>
          </>
        );

      case 'reflection':
        return (
          <div>
            <Label>Reflection Prompt</Label>
            <Textarea
              value={component.content.prompt || ''}
              onChange={(e) => handleContentChange('prompt', e.target.value)}
              placeholder="What should students reflect on?"
              rows={4}
            />
          </div>
        );

      case 'instructions':
        return (
          <div>
            <Label>Instructions</Label>
            <Textarea
              value={component.content.text || ''}
              onChange={(e) => handleContentChange('text', e.target.value)}
              placeholder="Step-by-step instructions"
              rows={6}
            />
          </div>
        );

      default:
        return (
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
        );
    }
  };

  return (
    <Card className={`transition-shadow ${isDragging ? 'shadow-lg' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">
              {componentTypeLabels[component.component_type] || component.component_type}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(index)}>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">File Attachments</Label>
            </div>

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

            {/* Cloud file attachments */}
            {component.id ? (
              <>
                <OneDriveFilePicker onFileSelected={handleOneDriveFileSelected} />
                <OneDriveAttachmentsList 
                  componentId={component.id} 
                  showEmbeds={false}
                  canDelete={true}
                />
                <DriveFilePicker onFileSelected={handleDriveFileSelected} />
                <DriveAttachmentsList 
                  componentId={component.id} 
                  showEmbeds={false}
                  canDelete={true}
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Save this component first to attach cloud files
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
