import { X, FileText, Image, Video, File as FileIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FileItem {
  path: string;
  name: string;
  size: number;
  uploaded_at: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove?: (index: number) => void;
  canEdit?: boolean;
}

export const FileList = ({ files, onRemove, canEdit = false }: FileListProps) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="h-4 w-4" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-4 w-4" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <Video className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!files.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="text-muted-foreground">
              {getFileIcon(file.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {formatDate(file.uploaded_at)}
              </p>
            </div>
          </div>
          {canEdit && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="ml-2 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};