import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface SubmissionUploaderProps {
  assignmentId: string;
  onFileUploaded: (fileInfo: { path: string; name: string; size: number; uploaded_at: string }) => void;
  maxFiles?: number;
  allowedTypes?: string[];
}

const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'video/mp4',
  'video/quicktime'
];

export const SubmissionUploader = ({
  assignmentId,
  onFileUploaded,
  maxFiles = 5,
  allowedTypes = DEFAULT_ALLOWED_TYPES
}: SubmissionUploaderProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string>('');

  const uploadFile = async (file: File) => {
    if (!user) throw new Error('User not authenticated');

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `student/${user.id}/assignment/${assignmentId}/${fileName}`;

    try {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      const { data, error } = await supabase.storage
        .from('assignment-submissions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

      return {
        path: data.path,
        name: file.name,
        size: file.size,
        uploaded_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      // Remove progress tracking for this file after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [file.name]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');

    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setError('File size must be less than 100MB');
      } else if (error.code === 'file-invalid-type') {
        setError('File type not allowed');
      } else {
        setError('File upload failed');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of acceptedFiles) {
        const fileInfo = await uploadFile(file);
        onFileUploaded(fileInfo);
        
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded.`,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [assignmentId, onFileUploaded, user]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled: uploading
  });

  const hasActiveUploads = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive && !isDragReject ? 'border-primary bg-primary/5' : ''}
          ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
          ${!isDragActive && !isDragReject ? 'border-border' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        {uploading ? (
          <p className="text-muted-foreground">Uploading files...</p>
        ) : isDragActive ? (
          <p className="text-primary">Drop files here...</p>
        ) : (
          <div>
            <p className="text-foreground mb-2">
              Drag & drop files here, or <span className="text-primary">click to browse</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Max {maxFiles} files, 100MB each. Supports PDF, DOC, PPT, images, and videos.
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasActiveUploads && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate flex-1">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};