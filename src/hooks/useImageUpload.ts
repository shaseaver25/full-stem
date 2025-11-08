import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadImage = async (file: File, folder: string = 'quiz-images'): Promise<string> => {
    setUploading(true);
    setProgress(0);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(folder)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(folder)
        .getPublicUrl(filePath);

      setProgress(100);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: `Failed to upload image: ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string, folder: string = 'quiz-images'): Promise<void> => {
    try {
      // Extract file path from URL
      const urlParts = url.split(`${folder}/`);
      if (urlParts.length < 2) {
        throw new Error('Invalid image URL');
      }
      const filePath = urlParts[1];

      const { error } = await supabase.storage.from(folder).remove([filePath]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Image deleted',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete image: ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { uploadImage, deleteImage, uploading, progress };
};
