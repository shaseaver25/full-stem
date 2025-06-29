
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  file_url: string;
  thumbnail_url: string;
  tags: string[];
  subject: string;
  grade_level: string;
  is_published: boolean;
  version_number: number;
  created_at: string;
  created_by: string;
}

export const useContentLibrary = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content library",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: Partial<ContentItem>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Ensure required fields are present
      const insertData = {
        title: contentData.title || '',
        description: contentData.description,
        content_type: contentData.content_type || 'document',
        file_url: contentData.file_url,
        thumbnail_url: contentData.thumbnail_url,
        tags: contentData.tags || [],
        subject: contentData.subject,
        grade_level: contentData.grade_level,
        created_by: user.id,
        is_published: contentData.is_published || false,
        version_number: contentData.version_number || 1
      };

      const { data, error } = await supabase
        .from('content_library')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      setContent(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Content created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateContent = async (id: string, updates: Partial<ContentItem>) => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          version_number: updates.version_number || 1
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContent(prev => 
        prev.map(item => item.id === id ? data : item)
      );

      toast({
        title: "Success",
        description: "Content updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContent(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Content deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive"
      });
      throw error;
    }
  };

  const publishContent = async (id: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .update({ is_published: isPublished })
        .eq('id', id);

      if (error) throw error;

      setContent(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_published: isPublished } : item
        )
      );

      toast({
        title: "Success",
        description: `Content ${isPublished ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    content,
    loading,
    fetchContent,
    createContent,
    updateContent,
    deleteContent,
    publishContent
  };
};
