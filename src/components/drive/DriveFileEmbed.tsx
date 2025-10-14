import { Card } from '@/components/ui/card';
import { FileIcon, ExternalLink } from 'lucide-react';

interface DriveFileEmbedProps {
  fileId: string;
  fileName: string;
  mimeType: string;
  webViewLink: string;
  showPreview?: boolean;
  className?: string;
}

export function DriveFileEmbed({
  fileId,
  fileName,
  mimeType,
  webViewLink,
  showPreview = true,
  className = ''
}: DriveFileEmbedProps) {
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const isEmbeddable = mimeType.includes('pdf') || 
                       mimeType.includes('document') ||
                       mimeType.includes('spreadsheet') ||
                       mimeType.includes('presentation') ||
                       mimeType.includes('image') ||
                       mimeType.includes('video');

  const getFileIcon = () => {
    if (mimeType.includes('document')) return '📄';
    if (mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    return '📎';
  };

  if (!showPreview || !isEmbeddable) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFileIcon()}</span>
            <div>
              <p className="font-medium text-sm">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {mimeType.split('/')[1]?.toUpperCase() || 'File'}
              </p>
            </div>
          </div>
          <a
            href={webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{fileName}</span>
        </div>
        <a
          href={webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Open in Drive
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ paddingBottom: '75%' }}>
        <iframe
          src={previewUrl}
          className="absolute top-0 left-0 w-full h-full"
          allow="autoplay"
          title={fileName}
        />
      </div>
    </div>
  );
}
