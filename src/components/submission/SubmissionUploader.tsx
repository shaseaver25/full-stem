import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useFileUploadModal } from "@/hooks/useFileUploadModal";

interface SubmissionUploaderProps {
  assignmentId: string;
  onFileUploaded: (fileInfo: { 
    path: string; 
    name: string; 
    size: number;
    type: string;
    uploaded_at: string;
    url: string;
    source?: 'local' | 'drive' | 'onedrive';
    drive_file_id?: string;
    drive_link?: string;
  }) => void;
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
  const { open, FileUploadModal } = useFileUploadModal({
    bucket: 'assignment-submissions',
    storagePath: assignmentId ? `assignment/${assignmentId}` : undefined,
    maxFileSize: 100,
    allowedTypes,
    maxFiles,
    title: 'Upload Assignment File',
    description: 'Choose how you would like to upload your file',
    onFileUploaded
  });

  return (
    <>
      <Button
        onClick={open}
        className="w-full h-20 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 bg-background transition-colors"
        variant="outline"
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">Upload Files</p>
            <p className="text-xs text-muted-foreground">
              Click to choose from device, Google Drive, or OneDrive
            </p>
          </div>
        </div>
      </Button>
      <FileUploadModal />
    </>
  );
};