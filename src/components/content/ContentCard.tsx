
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Image, Music, Eye, Edit, Clock, Trash2 } from 'lucide-react';

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

interface ContentCardProps {
  item: ContentItem;
  onPublishToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  onViewVersions: (item: ContentItem) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onPublishToggle,
  onDelete,
  onViewVersions
}) => {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="relative">
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
                onClick={() => onViewVersions(item)}
              >
                <Clock className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant={item.is_published ? "secondary" : "default"}
                onClick={() => onPublishToggle(item.id, item.is_published)}
              >
                {item.is_published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCard;
