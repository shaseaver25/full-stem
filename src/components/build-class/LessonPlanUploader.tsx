import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';

interface LessonComponent {
  type: string;
  content: any;
  order?: number;
}

interface ParsedLesson {
  title: string;
  gradeLevel?: string;
  description?: string;
  objectives?: string[];
  videos?: { url: string; title: string }[];
  instructions?: string;
  duration?: number;
  desmosEnabled?: boolean;
  desmosType?: 'calculator' | 'geometry';
  components: LessonComponent[];
}

interface LessonPlanUploaderProps {
  onLessonParsed: (lesson: ParsedLesson) => void;
}

const LessonPlanUploader: React.FC<LessonPlanUploaderProps> = ({ onLessonParsed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [textContent, setTextContent] = useState('');
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let content = '';
      
      if (file.type === 'text/plain') {
        content = await file.text();
      } else if (file.type === 'application/pdf' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For PDF and DOCX, we'll need to extract text
        const fileBytes = await file.arrayBuffer();
        const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBytes)));
        
        const { data, error } = await supabase.functions.invoke('extract-text', {
          body: { 
            file: base64File,
            fileName: file.name,
            mimeType: file.type
          }
        });
        
        if (error) {
          throw new Error('Failed to extract text from file');
        }
        
        content = data.text;
      }

      setTextContent(content);
      await parseWithGPT(content);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to process the uploaded file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const parseWithGPT = async (content: string) => {
    setIsParsing(true);
    try {
      console.log('Parsing content:', content.substring(0, 200) + '...');
      
      const { data, error } = await supabase.functions.invoke('parse-lesson-plan', {
        body: { content }
      });

      console.log('Parse response:', { data, error });

      if (error) {
        console.error('Parse error:', error);
        throw new Error(error.message || 'Failed to parse lesson plan');
      }

      const parsedLesson: ParsedLesson = data;
      onLessonParsed(parsedLesson);
      
      toast({
        title: 'Success!',
        description: 'Lesson plan parsed successfully. Review the components below.',
      });
    } catch (error) {
      console.error('Error parsing with GPT:', error);
      toast({
        title: 'Parsing Error',
        description: `Failed to parse the lesson plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleTextParse = async () => {
    if (!textContent.trim()) {
      toast({
        title: 'No Content',
        description: 'Please enter lesson plan content to parse.',
        variant: 'destructive',
      });
      return;
    }
    await parseWithGPT(textContent);
  };

  const downloadTemplate = async (format: 'txt' | 'docx' = 'txt') => {
    if (format === 'txt') {
      const templateContent = `TAILOREDU LESSON PLAN TEMPLATE
===================

IMPORTANT: Replace ALL bracketed sections [like this] with your actual content. 
Do NOT keep the brackets - remove them entirely and write your content in their place.

Example:
WRONG: Lesson Title: [My Amazing Math Lesson]
RIGHT: Lesson Title: My Amazing Math Lesson

---

Lesson Title: [Enter your lesson title here]

Grade Level: [e.g., 5th Grade, High School, etc.]

Subject: [e.g., Mathematics, Science, Technology, etc.]

Duration: [e.g., 50 minutes, 90 minutes, etc.]

Video Link (Optional): [YouTube or other video URL]

Learning Objectives:
- [First learning objective]
- [Second learning objective]
- [Third learning objective]

Written Instructions:
[Use full sentences, steps, or directions for students. Be specific about what students should do during the lesson.]

Assignment Instructions:
[Include submission details and task. Describe what students need to complete and how to submit it.]

Discussion Prompt:
[Add a question or topic for class discussion]

Reflection Question (Optional):
[Add a question for students to reflect on their learning]

Rubric (Optional):
[Paste rubric or describe criteria for grading]

Additional Resources (links, PDFs, etc.):
[List any additional materials, websites, or resources students might need]

Formative Check / Quiz:
[Paste sample questions or quiz outline to check student understanding]

Graphing Tool Needed? [Yes/No]
Desmos Tool Type (if yes): [Graphing Calculator / Geometry Tool]

INSTRUCTIONS:
1. Replace ALL bracketed sections with your actual content
2. Remove the brackets entirely - they are just placeholders
3. Save this document
4. Upload it to TailorEDU's lesson builder
5. Review the auto-generated components
6. Make any needed adjustments
7. Publish your lesson!`;

      const blob = new Blob([templateContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TailorEDU_Lesson_Plan_Template.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Template Downloaded',
        description: 'Text lesson plan template has been downloaded to your computer.',
      });
    } else {
      // Download Word document template
      try {
        const { data, error } = await supabase.functions.invoke('generate-docx', {
          body: { templateType: 'lesson-plan-template' }
        });

        if (error) {
          throw new Error('Failed to generate Word template');
        }

        // Convert base64 to blob and download
        const binaryString = atob(data.docxContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Word Template Downloaded',
          description: 'Word document lesson plan template has been downloaded to your computer.',
        });
      } catch (error) {
        console.error('Error downloading Word template:', error);
        toast({
          title: 'Download Error',
          description: 'Failed to download Word template. Please try the text version instead.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Smart Lesson Plan Uploader
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download Template */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">Need a template?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Download our standardized lesson plan template to get started.
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button onClick={() => downloadTemplate('txt')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Text (.txt)
                </Button>
                <Button onClick={() => downloadTemplate('docx')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Word (.docx)
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label className="text-base font-medium">Upload Lesson Plan</Label>
            <div
              {...getRootProps()}
              className={`mt-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive
                    ? 'Drop the file here...'
                    : 'Drag & drop a lesson plan file, or click to select'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports .txt, .pdf, and .docx files
                </p>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Or Paste Lesson Plan Text</Label>
            <Textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your lesson plan content following the template format..."
              rows={8}
              className="resize-none"
            />
            <Button 
              onClick={handleTextParse} 
              disabled={!textContent.trim() || isParsing}
              className="w-full"
            >
              {isParsing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing with AI...
                </>
              ) : (
                'Parse Lesson Plan'
              )}
            </Button>
          </div>

          {/* Status */}
          {(isUploading || isParsing) && (
            <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span>
                {isUploading ? 'Uploading and extracting text...' : 'Parsing with AI...'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonPlanUploader;