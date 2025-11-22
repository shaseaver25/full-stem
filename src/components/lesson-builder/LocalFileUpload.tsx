import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useFileUploadModal } from '@/hooks/useFileUploadModal';

interface LocalFileUploadProps {
  onFileUploaded: (file: { name: string; path: string; url: string }) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function LocalFileUpload({ 
  onFileUploaded, 
  disabled = false,
  variant = 'outline',
  size = 'default'
}: LocalFileUploadProps) {
  const { open, FileUploadModal } = useFileUploadModal({
    bucket: 'lesson-files',
    maxFileSize: 100,
    maxFiles: 1,
    title: 'Upload File',
    description: 'Choose how you would like to upload your file',
    onFileUploaded: (fileInfo) => {
      onFileUploaded({
        name: fileInfo.name,
        path: fileInfo.path,
        url: fileInfo.url
      });
    }
  });

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={open}
        disabled={disabled}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload File
      </Button>
      <FileUploadModal />
    </>
  );
}
