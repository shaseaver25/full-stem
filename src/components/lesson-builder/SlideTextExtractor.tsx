import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileImage, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as pdfjsLib from 'pdfjs-dist';

// Set PDF.js worker to use local file in public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface SlideTextExtractorProps {
  onTextsExtracted: (texts: string[]) => void;
}

export const SlideTextExtractor = ({ onTextsExtracted }: SlideTextExtractorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const convertPdfToImages = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    
    // Explicitly set worker before loading document
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      isEvalSupported: false,
      useWorkerFetch: false,
      verbosity: 0
    }).promise;
    const images: string[] = [];

    setProgress({ current: 0, total: pdf.numPages });

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext: any = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;

      const imageData = canvas.toDataURL('image/png');
      images.push(imageData);
      
      setProgress({ current: i, total: pdf.numPages });
    }

    return images;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'PDF file must be less than 20MB',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert PDF to images
      toast({
        title: 'Converting PDF',
        description: 'Extracting slide images from PDF...',
      });

      const images = await convertPdfToImages(file);

      // Extract text using AI Vision
      toast({
        title: 'Extracting Text',
        description: `Processing ${images.length} slides with AI Vision...`,
      });

      const { data, error } = await supabase.functions.invoke('extract-slide-text', {
        body: { images }
      });

      if (error) throw error;

      if (!data.slides || data.slides.length === 0) {
        throw new Error('No text extracted from slides');
      }

      // Extract just the text from each slide
      const extractedTexts = data.slides.map((slide: any) => slide.text || '');

      onTextsExtracted(extractedTexts);

      toast({
        title: 'Success!',
        description: `Extracted text from ${extractedTexts.length} slides`,
      });

    } catch (error) {
      console.error('Error extracting text:', error);
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Failed to extract text from slides',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card className="p-4 border-2 border-dashed">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileImage className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">AI Vision Text Extraction</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Upload a PDF of your slides and AI will automatically extract the text from each slide.
              Works with any presentation format exported to PDF.
            </p>
            
            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {progress.total > 0 
                      ? `Processing slide ${progress.current} of ${progress.total}...`
                      : 'Starting extraction...'}
                  </span>
                </div>
                {progress.total > 0 && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF Slides
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Export your presentation to PDF first</li>
            <li>Works with Google Slides, PowerPoint, Keynote, Prezi, etc.</li>
            <li>Max file size: 20MB</li>
            <li>Review extracted text before saving</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};