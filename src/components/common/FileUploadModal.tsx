import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FolderOpen, AlertCircle, X, File, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { DriveFilePicker } from '@/components/drive/DriveFilePicker';
import { OneDriveFilePicker } from '@/components/onedrive/OneDriveFilePicker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded: (fileInfo: {
    path: string;
    name: string;
    size: number;
    type: string;
    uploaded_at: string;
    url: string;
    source: 'local' | 'drive' | 'onedrive';
    drive_file_id?: string;
    drive_link?: string;
  }) => void;
  bucket?: string;
  storagePath?: string;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  maxFiles?: number;
  title?: string;
  description?: string;
}

const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime'
];

export function FileUploadModal({
  open,
  onOpenChange,
  onFileUploaded,
  bucket = 'assignment-submissions',
  storagePath,
  maxFileSize = 100,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxFiles = 1,
  title = 'Upload File',
  description = 'Choose how you would like to upload your file'
}: FileUploadModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Upload file to Supabase Storage
  const uploadToStorage = async (file: File) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = storagePath ? `${storagePath}/${fileName}` : `uploads/${user.id}/${fileName}`;

    try {
      setUploadProgress(0);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        path: data.path,
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
        url: urlData.publicUrl,
        source: 'local' as const
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Handle local file selection
  const handleLocalFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const filesArray = Array.from(files);

    // Validate file count
    if (filesArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    const oversizedFiles = filesArray.filter(f => f.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      setError(`File size must be less than ${maxFileSize}MB`);
      return;
    }

    // Validate file types
    const invalidFiles = filesArray.filter(f => !allowedTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      setError('One or more files have unsupported file types');
      return;
    }

    setSelectedFiles(filesArray);
    setIsUploading(true);

    try {
      for (const file of filesArray) {
        const fileInfo = await uploadToStorage(file);
        onFileUploaded(fileInfo);
        
        toast({
          title: 'File uploaded successfully',
          description: `${file.name} has been uploaded.`
        });
      }

      // Reset and close
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload file. Please try again.');
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle Google Drive file selection
  const handleDriveFileSelected = useCallback((file: {
    id: string;
    name: string;
    mimeType: string;
    url: string;
  }) => {
    console.log('📎 Drive file selected:', file);

    onFileUploaded({
      path: file.url,
      name: file.name,
      size: 0,
      type: file.mimeType,
      uploaded_at: new Date().toISOString(),
      url: file.url,
      source: 'drive',
      drive_file_id: file.id,
      drive_link: file.url
    });

    toast({
      title: 'Google Drive file attached',
      description: `${file.name} has been attached from Google Drive.`
    });

    onOpenChange(false);
  }, [onFileUploaded, onOpenChange, toast]);

  // Handle OneDrive file selection
  const handleOneDriveFileSelected = useCallback((file: {
    id: string;
    name: string;
    mimeType: string;
    webUrl: string;
  }) => {
    console.log('📎 OneDrive file selected:', file);

    onFileUploaded({
      path: file.webUrl,
      name: file.name,
      size: 0,
      type: file.mimeType,
      uploaded_at: new Date().toISOString(),
      url: file.webUrl,
      source: 'onedrive',
      drive_file_id: file.id,
      drive_link: file.webUrl
    });

    toast({
      title: 'OneDrive file attached',
      description: `${file.name} has been attached from OneDrive.`
    });

    onOpenChange(false);
  }, [onFileUploaded, onOpenChange, toast]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="file-upload-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="file-upload-description">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Local File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept={allowedTypes.join(',')}
            multiple={maxFiles > 1}
            className="hidden"
            aria-label="File input"
          />

          <Button
            onClick={handleLocalFileSelect}
            disabled={isUploading}
            className="w-full h-12 justify-start gap-3 bg-primary hover:bg-primary/90"
            aria-label="Upload file from device"
          >
            <Upload className="h-5 w-5" />
            <span className="flex-1 text-left">Upload from Device</span>
          </Button>

          {/* OneDrive Upload */}
          <div className="w-full [&_button]:w-full [&_button]:h-12 [&_button]:justify-start [&_button]:gap-3 [&_p]:hidden [&_button]:bg-[#0078D4] [&_button]:hover:bg-[#0078D4]/90 [&_button]:text-white">
            <OneDriveFilePicker
              onFileSelected={handleOneDriveFileSelected}
              disabled={isUploading}
              variant="default"
              size="default"
            />
          </div>

          {/* Google Drive Upload */}
          <div className="w-full [&_button]:w-full [&_button]:h-12 [&_button]:justify-start [&_button]:gap-3 [&_p]:hidden [&_button]:bg-[#4285F4] [&_button]:hover:bg-[#4285F4]/90 [&_button]:text-white">
            <DriveFilePicker
              onFileSelected={handleDriveFileSelected}
              disabled={isUploading}
              variant="default"
              size="default"
            />
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-medium">Selected Files:</h4>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Max {maxFiles} file(s), {maxFileSize}MB each. Supports PDF, DOC, PPT, images, and videos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}