import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LocalFileUploadProps {
  onFileUploaded: (file: { name: string; path: string; url: string }) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function LocalFileUpload({ 
  onFileUploaded, 
  disabled = false,
  variant = 'outline',
  size = 'default'
}: LocalFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement)?.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('User not authenticated');
          }

          // Create path with timestamp to prevent overwriting
          const timestamp = Date.now();
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const path = `teacher-${user.id}/${timestamp}-${sanitizedFileName}`;

          console.log('📤 Uploading file to:', path);

          const { error: uploadError } = await supabase.storage
            .from('lesson-files')
            .upload(path, file);

          if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            throw uploadError;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('lesson-files')
            .getPublicUrl(path);

          console.log('✅ File uploaded successfully:', path);

          toast({
            title: 'File Uploaded',
            description: `"${file.name}" has been uploaded successfully.`,
          });

          onFileUploaded({
            name: file.name,
            path: path,
            url: publicUrl
          });
        } catch (err: any) {
          console.error('❌ Upload failed:', err);
          toast({
            title: 'Upload Failed',
            description: err.message || 'Failed to upload file. Please try again.',
            variant: 'destructive'
          });
        } finally {
          setIsUploading(false);
        }
      };
      
      input.click();
    } catch (err: any) {
      console.error('❌ Error initializing upload:', err);
      toast({
        title: 'Error',
        description: 'Failed to initialize file upload.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleFileUpload}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Cloud integrations temporarily disabled — upload files directly instead.
      </p>
    </div>
  );
}
