import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Progress } from '@/components/ui/progress';

interface ImageUploadInputProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  onRemove: () => void;
  maxSizeMB?: number;
  accept?: string;
}

export const ImageUploadInput = ({
  onUpload,
  currentImage,
  onRemove,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/png,image/gif,image/webp',
}: ImageUploadInputProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, progress } = useImageUpload();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      alert('Invalid file format. Please use JPG, PNG, GIF, or WebP');
      return;
    }

    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (currentImage) {
    return (
      <div className="relative inline-block">
        <img
          src={currentImage}
          alt="Question"
          className="max-w-xs rounded border"
        />
        <Button
          size="sm"
          variant="destructive"
          className="absolute top-2 right-2"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border'
        } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={uploading}
        />

        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <Progress value={progress} className="w-full max-w-xs" />
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: {maxSizeMB}MB. Formats: JPG, PNG, GIF, WebP
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
