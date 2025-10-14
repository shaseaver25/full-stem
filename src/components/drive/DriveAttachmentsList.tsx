import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ExternalLink, FileIcon } from 'lucide-react';
import { DriveFileEmbed } from './DriveFileEmbed';

interface DriveAttachment {
  id: string;
  file_id: string;
  file_name: string;
  mime_type: string;
  web_view_link: string;
  created_at: string;
  metadata: any;
}

interface DriveAttachmentsListProps {
  componentId: string;
  showEmbeds?: boolean;
  canDelete?: boolean;
}

export function DriveAttachmentsList({ 
  componentId, 
  showEmbeds = true,
  canDelete = true 
}: DriveAttachmentsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attachments
  const { data: attachments, isLoading } = useQuery({
    queryKey: ['drive-attachments', componentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drive_attachments')
        .select('*')
        .eq('lesson_component_id', componentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DriveAttachment[];
    },
    enabled: !!componentId
  });

  // Delete attachment
  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const { error } = await supabase
        .from('drive_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive-attachments', componentId] });
      toast({
        title: 'Attachment Removed',
        description: 'Drive file has been removed from this component.',
      });
    },
    onError: (error) => {
      console.error('❌ Error deleting attachment:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove attachment. Please try again.',
        variant: 'destructive'
      });
    }
  });

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading attachments...
      </div>
    );
  }

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">
        Drive Attachments ({attachments.length})
      </h4>
      <div className="space-y-3">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="space-y-2">
            {showEmbeds ? (
              <DriveFileEmbed
                fileId={attachment.file_id}
                fileName={attachment.file_name}
                mimeType={attachment.mime_type}
                webViewLink={attachment.web_view_link}
                showPreview={true}
              />
            ) : (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{attachment.file_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={attachment.web_view_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(attachment.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
            {canDelete && showEmbeds && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(attachment.id)}
                disabled={deleteMutation.isPending}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Attachment
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
