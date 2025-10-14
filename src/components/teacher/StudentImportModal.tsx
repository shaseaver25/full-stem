import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Download, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudentImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onImportComplete: () => void;
}

interface ImportResult {
  success: boolean;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  action: 'created' | 'existing' | 'error';
  error?: string;
}

export function StudentImportModal({
  open,
  onOpenChange,
  classId,
  onImportComplete
}: StudentImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setValidationErrors(['Please select a CSV file']);
        return;
      }
      setFile(selectedFile);
      setValidationErrors([]);
      setResults(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'first_name,last_name,email,grade_level,student_id\nJohn,Doe,john.doe@example.com,9th,\nJane,Smith,jane.smith@example.com,10th,';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) {
      setValidationErrors(['Please select a file']);
      return;
    }

    setImporting(true);
    setValidationErrors([]);
    setResults(null);

    try {
      // Read file content
      const text = await file.text();
      
      // Basic validation
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        setValidationErrors(['CSV file must contain at least a header row and one data row']);
        setImporting(false);
        return;
      }

      const headers = lines[0].toLowerCase();
      const requiredFields = ['first_name', 'last_name', 'email'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        setValidationErrors([`Missing required columns: ${missingFields.join(', ')}`]);
        setImporting(false);
        return;
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('import-students-csv', {
        body: {
          csvData: text,
          classId: classId
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        setValidationErrors([data.error]);
        setImporting(false);
        return;
      }

      setResults(data.results);
      
      toast({
        title: 'Import Complete',
        description: `Successfully imported ${data.summary.successful} students. ${data.summary.errors} errors.`
      });

      if (data.summary.successful > 0) {
        onImportComplete();
      }

    } catch (error: any) {
      console.error('Import error:', error);
      setValidationErrors([error.message || 'Failed to import students']);
      toast({
        title: 'Import Failed',
        description: error.message || 'An error occurred during import',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationErrors([]);
    setResults(null);
    onOpenChange(false);
  };

  const successfulImports = results?.filter(r => r.success).length || 0;
  const failedImports = results?.filter(r => !r.success).length || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple students to your class at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Need a template?</p>
              <p className="text-sm text-muted-foreground">
                Download our CSV template with the required format
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select CSV File</label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={importing}
              />
              <Button
                onClick={handleImport}
                disabled={!file || importing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Import Results */}
          {results && (
            <div className="space-y-3">
              <div className="flex gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-green-600">{successfulImports}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-red-600">{failedImports}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Import Details:</p>
                <ScrollArea className="h-64 border rounded-lg p-4">
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          result.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                        }`}
                      >
                        {result.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {result.student.first_name} {result.student.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{result.student.email}</p>
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1">{result.error}</p>
                          )}
                          {result.success && (
                            <p className="text-sm text-green-600 mt-1">
                              {result.action === 'created' ? 'New account created' : 'Added to class'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-sm text-muted-foreground space-y-1 p-4 border rounded-lg bg-muted/30">
            <p className="font-medium">CSV Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Required columns: first_name, last_name, email</li>
              <li>Optional columns: grade_level, student_id</li>
              <li>If a student with the same email exists, they'll be added to this class</li>
              <li>New accounts will be created automatically for students who don't exist</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {results ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
