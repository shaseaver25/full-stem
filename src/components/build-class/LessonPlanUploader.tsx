import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to extract text from file');
        }
        
        const result = await response.json();
        content = result.text;
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
      const response = await fetch('/api/parse-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse lesson plan');
      }

      const parsedLesson: ParsedLesson = await response.json();
      onLessonParsed(parsedLesson);
      
      toast({
        title: 'Success!',
        description: 'Lesson plan parsed successfully. Review the components below.',
      });
    } catch (error) {
      console.error('Error parsing with GPT:', error);
      toast({
        title: 'Parsing Error',
        description: 'Failed to parse the lesson plan. Please check the format and try again.',
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

  const downloadTemplate = () => {
    const templateContent = `LESSON PLAN TEMPLATE
===================

Lesson Title: [Enter your lesson title here]

Grade Level: [e.g., 5th Grade, High School, etc.]

Video Link: [YouTube or other video URL - optional]

Written Instructions:
[Use full sentences, steps, or directions for students. Be specific about what students should do during the lesson.]

Assignment Instructions:
[Include submission details and task. Describe what students need to complete and how to submit it.]

Discussion Prompt:
[Add a question or topic for class discussion]

Reflection Question (optional):
[Add a question for students to reflect on their learning]

Rubric (optional):
[Paste rubric or describe criteria for grading]

Additional Resources (links, PDFs, etc.):
[List any additional materials, websites, or resources students might need]

Formative Check / Quiz:
[Paste sample questions or quiz outline to check student understanding]

Graphing Tool Needed? [Yes/No]
Desmos Tool Type (if yes): [Graphing Calculator / Geometry Tool]

INSTRUCTIONS:
1. Fill out each section above
2. Save this document
3. Upload it to TailorEDU's lesson builder
4. Review the auto-generated components
5. Make any needed adjustments
6. Publish your lesson!`;

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
      description: 'Lesson plan template has been downloaded to your computer.',
    });
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
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="font-medium">Need a template?</h3>
              <p className="text-sm text-gray-600">
                Download our standardized lesson plan template to get started.
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
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