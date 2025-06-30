
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ContentHeader from './ContentHeader';
import ContentFilters from './ContentFilters';
import ContentCard from './ContentCard';
import VersionHistoryModal from './VersionHistoryModal';

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

interface ContentVersion {
  id: string;
  version_number: number;
  title: string;
  description: string;
  changes_summary: string;
  created_at: string;
}

const ContentLibrary = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'document',
    subject: '',
    grade_level: '',
    tags: '',
    file_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    fetchContent();
  }, []);

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

  const fetchVersions = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', contentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const handleCreateContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('content_library')
        .insert({
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          subject: formData.subject,
          grade_level: formData.grade_level,
          file_url: formData.file_url,
          thumbnail_url: formData.thumbnail_url,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setContent(prev => [data, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        content_type: 'document',
        subject: '',
        grade_level: '',
        tags: '',
        file_url: '',
        thumbnail_url: ''
      });

      toast({
        title: "Success",
        description: "Content created successfully"
      });
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive"
      });
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setContent(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_published: !currentStatus } : item
        )
      );

      toast({
        title: "Success",
        description: `Content ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContent = async (id: string) => {
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
    }
  };

  const handleViewVersions = (item: ContentItem) => {
    setSelectedContent(item);
    fetchVersions(item.id);
    setIsVersionModalOpen(true);
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.content_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading content library...</div>;
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        formData={formData}
        setFormData={setFormData}
        onCreateContent={handleCreateContent}
      />

      <ContentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onPublishToggle={handlePublishToggle}
            onDelete={handleDeleteContent}
            onViewVersions={handleViewVersions}
          />
        ))}
      </div>

      <VersionHistoryModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        selectedContent={selectedContent}
        versions={versions}
      />
    </div>
  );
};

export default ContentLibrary;
