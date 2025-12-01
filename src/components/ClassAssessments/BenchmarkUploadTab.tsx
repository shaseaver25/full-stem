import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface BenchmarkUploadTabProps {
  classId: string;
  onSuccess: () => void;
}

export const BenchmarkUploadTab = ({ classId, onSuccess }: BenchmarkUploadTabProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [extractQuestions, setExtractQuestions] = useState(true);
  const [matchToLessons, setMatchToLessons] = useState(true);
  const [suggestAdditional, setSuggestAdditional] = useState(true);
  const [numberOfQuestions, setNumberOfQuestions] = useState('25');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 10MB',
          variant: 'destructive',
        });
        return;
      }

      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Only PDF, DOCX, and TXT files are supported',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an assessment title',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement file upload and processing
      toast({
        title: 'Coming Soon',
        description: 'Benchmark upload functionality will be available soon',
      });
      
      // Placeholder for actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));

      onSuccess();
    } catch (error: any) {
      console.error('Error uploading benchmark:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload benchmark',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
        <FileText className="h-5 w-5 text-primary mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Upload Benchmark Assessment Document</p>
          <p className="text-muted-foreground">
            AI will analyze your document and generate aligned assessment questions
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="benchmark-title">Assessment Title *</Label>
        <Input
          id="benchmark-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., State Standards Assessment"
        />
      </div>

      <div>
        <Label>Upload Benchmark Document</Label>
        <Card className="mt-2 p-8 border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">
                {selectedFile ? selectedFile.name : 'Drag and drop or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: PDF, DOCX, TXT • Max size: 10MB
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
            />
          </label>
        </Card>
      </div>

      <div>
        <Label htmlFor="doc-description">Document Description</Label>
        <Textarea
          id="doc-description"
          value={docDescription}
          onChange={(e) => setDocDescription(e.target.value)}
          placeholder="e.g., Minnesota State Math Standards Grade 8"
          rows={2}
        />
      </div>

      <Card className="p-4 space-y-3">
        <h4 className="font-medium">AI Processing Options</h4>
        <p className="text-sm text-muted-foreground">After upload, AI will:</p>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="extract"
              checked={extractQuestions}
              onCheckedChange={(checked) => setExtractQuestions(checked as boolean)}
            />
            <Label htmlFor="extract" className="cursor-pointer">
              Extract questions from document
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="match"
              checked={matchToLessons}
              onCheckedChange={(checked) => setMatchToLessons(checked as boolean)}
            />
            <Label htmlFor="match" className="cursor-pointer">
              Match to lesson content
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="suggest"
              checked={suggestAdditional}
              onCheckedChange={(checked) => setSuggestAdditional(checked as boolean)}
            />
            <Label htmlFor="suggest" className="cursor-pointer">
              Suggest additional questions
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="num-gen">Number of questions to generate</Label>
          <Input
            id="num-gen"
            type="number"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(e.target.value)}
            min="5"
            max="100"
          />
        </div>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-2">How it works:</p>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Upload your benchmark document</li>
            <li>AI analyzes document and lesson content</li>
            <li>Questions are generated and mapped to standards</li>
            <li>Review and edit before publishing</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleUpload}
          disabled={loading || !selectedFile}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Process
            </>
          )}
        </Button>
      </div>
    </div>
  );
};