import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ClassStudentImportProps {
  classId: string;
  onImportComplete?: () => void;
}

export const ClassStudentImport = ({ classId, onImportComplete }: ClassStudentImportProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      'first_name',
      'last_name', 
      'email',
      'grade',
      'class_id',
      'has_IEP',
      'has_504',
      'is_ESL',
      'primary_language',
      'notes'
    ];
    const exampleRow = [
      'Katie',
      'Johnson',
      'katie.johnson@example.com',
      '5',
      classId,
      'True',
      'False',
      'True',
      'Spanish',
      'Reading support recommended'
    ];
    const csvContent = headers.join(',') + '\n' + exampleRow.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template_with_IEP_504_ESL.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Template Downloaded',
      description: 'Fill in the template with student information including IEP, 504, and ESL status.',
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const csvText = await file.text();
      
      const { data: authData } = await supabase.auth.getSession();
      if (!authData?.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('import-students-csv', {
        body: { csvData: csvText, classId },
      });

      if (error) throw error;

      const { summary } = data;

      toast({
        title: 'Import Complete',
        description: `Successfully added ${summary.successful} student(s). ${summary.errors > 0 ? `${summary.errors} error(s).` : ''}`,
      });

      if (onImportComplete) {
        onImportComplete();
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import students',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-t pt-3 mt-3">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">Import Students</h4>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
          className="flex-1 text-xs h-8"
        >
          <Download className="h-3 w-3 mr-1" />
          Template
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 text-xs h-8"
        >
          {uploading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3 mr-1" />
              Upload CSV
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};
