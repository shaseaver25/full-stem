import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
}

interface AttachDriveFileParams {
  componentId: string;
  file: DriveFile;
}

export function useDriveAttachment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const attachFileMutation = useMutation({
    mutationFn: async ({ componentId, file }: AttachDriveFileParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('drive_attachments')
        .insert({
          lesson_component_id: componentId,
          file_id: file.id,
          file_name: file.name,
          mime_type: file.mimeType,
          web_view_link: file.url,
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
        queryKey: ['drive-attachments', variables.componentId] 
      });
      toast({
        title: 'Success',
        description: 'Drive file attached successfully!',
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
