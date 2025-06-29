
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Video, Image, Music, Eye, Edit, Trash2, Clock, User } from 'lucide-react';

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
          ...formData,
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

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Library</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>
                Add new educational content to your library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Content title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Content description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="content_type">Content Type</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="interactive">Interactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Math, Science, etc."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Input
                    id="grade_level"
                    value={formData.grade_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade_level: e.target.value }))}
                    placeholder="K-12, College, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="file_url">File URL</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                  placeholder="https://example.com/file.pdf"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateContent}>
                  Create Content
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <Input
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="interactive">Interactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getContentIcon(item.content_type)}
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <Badge variant={item.is_published ? "default" : "secondary"}>
                  {item.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{item.subject} • {item.grade_level}</span>
                  <span>v{item.version_number}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedContent(item);
                        fetchVersions(item.id);
                        setIsVersionModalOpen(true);
                      }}
                    >
                      <Clock className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant={item.is_published ? "secondary" : "default"}
                      onClick={() => handlePublishToggle(item.id, item.is_published)}
                    >
                      {item.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteContent(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isVersionModalOpen} onOpenChange={setIsVersionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              {selectedContent?.title} - Version tracking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {versions.map((version) => (
              <Card key={version.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Version {version.version_number}</h4>
                      <p className="text-sm text-muted-foreground">{version.title}</p>
                      <p className="text-sm mt-1">{version.description}</p>
                      {version.changes_summary && (
                        <p className="text-sm text-blue-600 mt-1">
                          Changes: {version.changes_summary}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(version.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentLibrary;
