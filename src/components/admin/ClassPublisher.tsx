
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassApi } from '@/hooks/useClassApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, BookOpen, Clock, Eye, EyeOff, Edit, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const ClassPublisher = () => {
  const { useClasses, publishClass, deleteClass, isPublishing, isDeleting } = useClassApi();
  const { data: draftClasses, isLoading: loadingDrafts } = useClasses(false);
  const { data: publishedClasses, isLoading: loadingPublished } = useClasses(true);

  const handlePublish = async (classId: string) => {
    try {
      await publishClass(classId);
    } catch (error) {
      console.error('Error publishing class:', error);
    }
  };

  const handleUnpublish = async (classId: string) => {
    try {
      // Unpublish by updating the published status
      await publishClass(classId); // This will toggle the status
    } catch (error) {
      console.error('Error unpublishing class:', error);
    }
  };

  const handleDelete = async (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        await deleteClass(classId);
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  if (loadingDrafts || loadingPublished) {
    return <LoadingSpinner size="md" text="Loading classes..." fullScreen={false} />;
  }

  return (
    <div className="space-y-8">
      {/* Draft Classes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Draft Classes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {draftClasses?.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onPublish={handlePublish}
              onDelete={handleDelete}
              isPublishing={isPublishing}
              isDeleting={isDeleting}
              isDraft={true}
            />
          ))}
          {(!draftClasses || draftClasses.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-gray-500">
                No draft classes available.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Published Classes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Published Classes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publishedClasses?.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onPublish={handleUnpublish}
              onDelete={handleDelete}
              isPublishing={isPublishing}
              isDeleting={isDeleting}
              isDraft={false}
            />
          ))}
          {(!publishedClasses || publishedClasses.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-gray-500">
                No published classes available.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

interface ClassCardProps {
  classItem: any;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  isPublishing: boolean;
  isDeleting: boolean;
  isDraft: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  onPublish,
  onDelete,
  isPublishing,
  isDeleting,
  isDraft
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/admin/ai-course-builder?courseId=${classItem.id}`);
  };

  const handleView = () => {
    navigate(`/teacher/classes/${classItem.id}`);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{classItem.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {classItem.description || 'No description available'}
            </CardDescription>
          </div>
          <Badge variant={isDraft ? "secondary" : "default"}>
            {isDraft ? "Draft" : "Published"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {classItem.grade_level && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span>{classItem.grade_level}</span>
            </div>
          )}
          {classItem.subject && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span>{classItem.subject}</span>
            </div>
          )}
          {classItem.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{classItem.duration}</span>
            </div>
          )}
          {classItem.max_students && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>Max {classItem.max_students}</span>
            </div>
          )}
        </div>

        {classItem.published_at && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Published {format(new Date(classItem.published_at), 'MMM dd, yyyy')}</span>
          </div>
        )}

        <div className="space-y-2 pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isDraft ? "default" : "outline"}
              size="sm"
              onClick={() => onPublish(classItem.id)}
              disabled={isPublishing}
              className="flex-1"
            >
              {isDraft ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Unpublishing...' : 'Unpublish'}
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(classItem.id)}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
