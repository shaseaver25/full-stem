import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OneDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webUrl: string;
}

interface AttachOneDriveFileParams {
  componentId: string;
  file: OneDriveFile;
}

export function useOneDriveAttachment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const attachFileMutation = useMutation({
    mutationFn: async ({ componentId, file }: AttachOneDriveFileParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('onedrive_attachments')
        .insert({
          lesson_component_id: componentId,
          file_id: file.id,
          file_name: file.name,
          mime_type: file.mimeType,
          web_url: file.webUrl,
          owner_id: user.id,
          metadata: {
            attached_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['onedrive-attachments', variables.componentId] 
      });
      toast({
        title: 'Success',
        description: 'OneDrive file attached successfully!',
      });
    },
    onError: (error) => {
      console.error('❌ Error attaching file:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach file. Please try again.',
        variant: 'destructive'
      });
    }
  });

  return {
    attachFile: attachFileMutation.mutate,
    isAttaching: attachFileMutation.isPending
  };
}
