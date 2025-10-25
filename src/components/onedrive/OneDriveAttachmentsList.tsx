import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OneDriveFileEmbed } from './OneDriveFileEmbed';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface OneDriveAttachment {
  id: string;
  file_id: string;
  file_name: string;
  mime_type: string;
  web_url: string;
  created_at: string;
  metadata: any;
}

interface OneDriveAttachmentsListProps {
  componentId: string;
  showEmbeds?: boolean;
  canDelete?: boolean;
}

export function OneDriveAttachmentsList({ 
  componentId, 
  showEmbeds = true,
  canDelete = true 
}: OneDriveAttachmentsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attachments
  const { data: attachments, isLoading } = useQuery({
    queryKey: ['onedrive-attachments', componentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onedrive_attachments')
        .select('*')
        .eq('lesson_component_id', componentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as OneDriveAttachment[];
    },
    enabled: !!componentId
  });

  // Delete attachment mutation
  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const { error } = await supabase
        .from('onedrive_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onedrive-attachments', componentId] });
      toast({
        title: 'Success',
        description: 'OneDrive attachment removed successfully.',
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
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>📎 OneDrive Attachments</span>
        <span className="text-muted-foreground">({attachments.length})</span>
      </div>

      <div className="space-y-4">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="relative group">
            <OneDriveFileEmbed
              fileId={attachment.file_id}
              fileName={attachment.file_name}
              mimeType={attachment.mime_type}
              webUrl={attachment.web_url}
              showPreview={showEmbeds}
            />
            
            {canDelete && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(attachment.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
