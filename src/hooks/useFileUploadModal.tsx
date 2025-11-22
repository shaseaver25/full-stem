import { useState, useCallback } from 'react';
import { FileUploadModal } from '@/components/common/FileUploadModal';

interface UseFileUploadModalOptions {
  bucket?: string;
  storagePath?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
  title?: string;
  description?: string;
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
}

export function useFileUploadModal(options: UseFileUploadModalOptions) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const FileUploadModalComponent = useCallback(() => (
    <FileUploadModal
      open={isOpen}
      onOpenChange={setIsOpen}
      {...options}
    />
  ), [isOpen, options]);

  return {
    open,
    close,
    isOpen,
    FileUploadModal: FileUploadModalComponent
  };
}