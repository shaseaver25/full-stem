import { Card } from '@/components/ui/card';
import { FileIcon, ExternalLink } from 'lucide-react';

interface OneDriveFileEmbedProps {
  fileId: string;
  fileName: string;
  mimeType: string;
  webUrl: string;
  showPreview?: boolean;
  className?: string;
}

export function OneDriveFileEmbed({
  fileId,
  fileName,
  mimeType,
  webUrl,
  showPreview = true,
  className = ''
}: OneDriveFileEmbedProps) {
  // OneDrive embed URL format
  const embedUrl = `${webUrl}/embed`;
  
  const isEmbeddable = mimeType.includes('pdf') || 
                       mimeType.includes('word') ||
                       mimeType.includes('document') ||
                       mimeType.includes('excel') ||
                       mimeType.includes('spreadsheet') ||
                       mimeType.includes('powerpoint') ||
                       mimeType.includes('presentation') ||
                       mimeType.includes('image') ||
                       mimeType.includes('video');

  const getFileIcon = () => {
    if (mimeType.includes('word') || mimeType.includes('document')) return '📄';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
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
            href={webUrl}
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
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Open in OneDrive
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ paddingBottom: '75%' }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          allow="autoplay"
          title={fileName}
        />
      </div>
    </div>
  );
}
