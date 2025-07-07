import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LessonTemplateManager = () => {
  const { toast } = useToast();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDownloadTemplate = () => {
    // Create a CSV template with lesson structure
    const templateContent = `Lesson ID,Title,Description,Track,Order,Text,Text (Grade 3),Text (Grade 5),Text (Grade 8),Source Doc URL,video_url
101,Sample Lesson Title,Brief description of the lesson,Excel,1,"Full lesson content here","Grade 3 simplified content","Grade 5 content","Grade 8 advanced content",https://example.com/doc,https://youtu.be/example
102,Another Lesson,Another description,Excel,2,"More lesson content","Simple version","Medium version","Advanced version",https://example.com/doc2,https://youtu.be/example2`;

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lesson_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "The lesson template has been downloaded successfully.",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUploadTemplate = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(true);

    try {
      const fileContent = await selectedFile.text();
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Skip header row and process each lesson
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const lessonData: any = {};

        // Only process essential columns and skip empty values
        const essentialColumns = ['Lesson ID', 'Title', 'Description', 'Track', 'Order', 'Text'];
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          // Only add non-empty values or essential columns
          if (value || essentialColumns.includes(header)) {
            lessonData[header] = value || null;
          }
        });

        // Convert Lesson ID to number (required)
        if (lessonData['Lesson ID']) {
          lessonData['Lesson ID'] = parseInt(lessonData['Lesson ID']);
        }

        // Convert Order to number (required)
        if (lessonData['Order']) {
          lessonData['Order'] = parseInt(lessonData['Order']);
        }

        // Skip row if missing essential data
        if (!lessonData['Lesson ID'] || !lessonData['Title']) {
          continue;
        }

        // Insert or update lesson in database
        const { error } = await supabase
          .from('Lessons')
          .upsert(lessonData, {
            onConflict: 'Lesson ID'
          });

        if (error) {
          console.error('Error upserting lesson:', error);
          toast({
            title: "Upload Error",
            description: `Error processing lesson ${lessonData['Lesson ID']}: ${error.message}`,
            variant: "destructive",
          });
          setUploadingFile(false);
          return;
        }
      }

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${lines.length - 1} lessons from the template.`,
      });

      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('template-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process the uploaded file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lesson Template Manager
        </CardTitle>
        <p className="text-sm text-gray-600">
          Download a template to create lessons in bulk, or upload a completed template
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Download Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Download Template</h3>
          <p className="text-sm text-gray-600">
            Download a CSV template with the correct format for creating lessons. 
            Fill in your lesson data and upload it back to create multiple lessons at once.
          </p>
          <Button onClick={handleDownloadTemplate} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download Lesson Template
          </Button>
        </div>

        <hr className="border-gray-200" />

        {/* Upload Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Upload Completed Template</h3>
          <p className="text-sm text-gray-600">
            Upload your completed CSV template to create or update lessons in the database.
          </p>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="template-file">Select CSV File</Label>
              <Input
                id="template-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Selected: {selectedFile.name}
              </div>
            )}

            <Button 
              onClick={handleUploadTemplate}
              disabled={!selectedFile || uploadingFile}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadingFile ? 'Uploading...' : 'Upload Template'}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Template Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep the header row exactly as provided</li>
            <li>• Use unique Lesson IDs for each lesson</li>
            <li>• Order field determines lesson sequence</li>
            <li>• Provide content for different grade levels</li>
            <li>• Include valid YouTube URLs for videos</li>
            <li>• Save the file as CSV format</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonTemplateManager;