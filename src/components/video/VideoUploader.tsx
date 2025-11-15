import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Video, Loader2 } from 'lucide-react';

interface VideoUploaderProps {
  lessonId?: string;
  onUploadComplete?: (videoId: string) => void;
}

export function VideoUploader({ lessonId, onUploadComplete }: VideoUploaderProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select a video file.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (500MB max)
      if (selectedFile.size > 500 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select a video under 500MB.',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and select a video file.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload videos');
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading video to storage:', fileName);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lesson-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-videos')
        .getPublicUrl(fileName);

      console.log('Video uploaded, creating database record...');

      // Create video record
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          lesson_id: lessonId || null,
          title,
          description: description || null,
          file_url: fileName,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
          transcription_status: 'pending',
        })
        .select()
        .single();

      if (videoError) {
        throw videoError;
      }

      setUploadProgress(75);

      console.log('Video record created, starting transcription...');

      // Start transcription
      setIsTranscribing(true);
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke(
        'transcribe-video',
        {
          body: { videoId: videoData.id },
        }
      );

      if (transcribeError) {
        console.error('Transcription error:', transcribeError);
        toast({
          title: 'Upload Successful',
          description: 'Video uploaded but transcription failed. You can retry later.',
        });
      } else {
        console.log('Transcription started successfully');
        toast({
          title: 'Success',
          description: 'Video uploaded and transcription started!',
        });
      }

      setUploadProgress(100);

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);

      if (onUploadComplete) {
        onUploadComplete(videoData.id);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setIsTranscribing(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upload Video
        </CardTitle>
        <CardDescription>
          Upload a video and we'll automatically generate transcripts and translations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description (optional)"
            disabled={isUploading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video-file">Video File *</Label>
          <Input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isTranscribing ? 'Transcribing...' : 'Uploading...'}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || !file || !title.trim()}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isTranscribing ? 'Transcribing...' : 'Uploading...'}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
