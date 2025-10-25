import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LessonTemplateUploadProps {
  lessonId?: string;
  onImportComplete?: (lessonId: string, componentsCreated: number) => void;
}

export function LessonTemplateUpload({ 
  lessonId,
  onImportComplete 
}: LessonTemplateUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  const downloadTemplate = async () => {
    try {
      console.log('📥 Downloading lesson template...');
      
      const { data, error } = await supabase.functions.invoke('generate-lesson-template');

      if (error) {
        throw error;
      }

      // Create blob and download
      const blob = new Blob([data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TailorEDU_Lesson_Template.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Template Downloaded',
        description: 'Fill out the template and upload it when ready.',
      });
    } catch (err: any) {
      console.error('❌ Error downloading template:', err);
      toast({
        title: 'Download Failed',
        description: err.message || 'Failed to download template.',
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.docx';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (!file) return;

      // Validate file type
      const validExtensions = ['.txt', '.docx'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a .txt or .docx file.',
          variant: 'destructive'
        });
        return;
      }

      setIsUploading(true);

      try {
        console.log('📤 Uploading lesson template:', file.name);

        // Determine file type and read accordingly
        const isDocx = fileExtension === '.docx';
        
        if (isDocx) {
          // Handle .docx files
          const arrayBuffer = await file.arrayBuffer();
          const base64Data = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          console.log('✅ .docx file read as ArrayBuffer, sending to parser...');

          // Parse the template
          const { data, error } = await supabase.functions.invoke('parse-lesson-template', {
            body: {
              base64File: base64Data,
              fileType: 'docx',
              lessonId: lessonId || null
            }
          });

          if (error) {
            throw error;
          }

          console.log('✅ Lesson imported:', data);

          setImportResult(data);
          setShowResultDialog(true);

          if (onImportComplete) {
            onImportComplete(data.lessonId, data.componentsCreated);
          }

          toast({
            title: 'Lesson Imported Successfully',
            description: `Created ${data.componentsCreated} components from template.`,
          });

          setIsUploading(false);
        } else {
          // Handle .txt files
          const reader = new FileReader();
          
          reader.onload = async (event) => {
            try {
              const content = event.target?.result as string;
              
              // Basic validation
              if (!content.includes('## Component:')) {
                throw new Error('Invalid template format. Make sure the file contains ## Component: sections.');
              }

              if (!content.includes('# Lesson Metadata')) {
                throw new Error('Invalid template format. Missing metadata section.');
              }

              console.log('✅ File read successfully, parsing...');

              // Parse the template
              const { data, error } = await supabase.functions.invoke('parse-lesson-template', {
                body: {
                  parsedContent: content,
                  lessonId: lessonId || null
                }
              });

              if (error) {
                throw error;
              }

              console.log('✅ Lesson imported:', data);

              setImportResult(data);
              setShowResultDialog(true);

              if (onImportComplete) {
                onImportComplete(data.lessonId, data.componentsCreated);
              }

              toast({
                title: 'Lesson Imported Successfully',
                description: `Created ${data.componentsCreated} components from template.`,
              });
            } catch (err: any) {
              console.error('❌ Error parsing template:', err);
              toast({
                title: 'Import Failed',
                description: err.message || 'Failed to parse lesson template.',
                variant: 'destructive'
              });
            } finally {
              setIsUploading(false);
            }
          };

          reader.onerror = () => {
            toast({
              title: 'Read Failed',
              description: 'Failed to read file content.',
              variant: 'destructive'
            });
            setIsUploading(false);
          };

          reader.readAsText(file);
        }
      } catch (err: any) {
        console.error('❌ Error uploading template:', err);
        toast({
          title: 'Upload Failed',
          description: err.message || 'Failed to upload template.',
          variant: 'destructive'
        });
        setIsUploading(false);
      }
    };
    
    input.click();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={downloadTemplate}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleFileUpload}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Upload Template
            </>
          )}
        </Button>
      </div>

      {/* Import Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <DialogTitle>Lesson Imported Successfully</DialogTitle>
            </div>
            <DialogDescription>
              Your lesson template has been parsed and components have been created.
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>{importResult.componentsCreated} components</strong> were created from your template.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Lesson Details:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Title:</strong> {importResult.metadata.title}</li>
                  {importResult.metadata.subject && (
                    <li><strong>Subject:</strong> {importResult.metadata.subject}</li>
                  )}
                  {importResult.metadata.grade_level && (
                    <li><strong>Grade Level:</strong> {importResult.metadata.grade_level}</li>
                  )}
                  {importResult.metadata.duration && (
                    <li><strong>Duration:</strong> {importResult.metadata.duration} minutes</li>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Created Components:</h4>
                <div className="max-h-60 overflow-y-auto">
                  <ul className="text-sm space-y-1">
                    {importResult.components.map((comp: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        <span className="capitalize">{comp.type}</span>
                        <span className="text-muted-foreground">—</span>
                        <span>{comp.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Alert variant="default">
                <AlertDescription className="text-xs">
                  💡 <strong>Next Steps:</strong> Review and edit the imported components below. 
                  You can customize content, reorder components, and publish when ready.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>
              Continue Editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
