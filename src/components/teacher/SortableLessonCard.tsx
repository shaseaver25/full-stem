import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ClipboardList, Calendar, Clock, Trash2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  objectives: string[] | null;
  materials: string[] | null;
  duration: number | null;
  updated_at: string;
}

interface SortableLessonCardProps {
  lesson: Lesson;
  index: number;
  classId: string;
  onDelete: (lessonId: string) => void;
}

export function SortableLessonCard({ lesson, index, classId, onDelete }: SortableLessonCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="h-full transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <button
                className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-accent rounded"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              <Badge variant="outline">
                Lesson {index + 1}
              </Badge>
            </div>
            {lesson.duration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {lesson.duration} min
              </div>
            )}
          </div>
          <CardTitle className="line-clamp-2">
            {lesson.title}
          </CardTitle>
          {lesson.description && (
            <CardDescription className="line-clamp-2">
              {lesson.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            {lesson.objectives && lesson.objectives.length > 0 && (
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">
                  {lesson.objectives.length} objective{lesson.objectives.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {lesson.materials && lesson.materials.length > 0 && (
              <div className="flex items-start gap-2">
                <ClipboardList className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">
                  {lesson.materials.length} material{lesson.materials.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">
                Updated {format(new Date(lesson.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(lesson.id)}
              className="w-full flex items-center gap-2"
              title="Delete this lesson"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Link to={`/class-lesson/${lesson.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                Teacher Preview
              </Button>
            </Link>
            <Link to={`/student/lesson/${lesson.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                View as Student
              </Button>
            </Link>
            <Link to={`/teacher/lesson-builder?classId=${classId}&lessonId=${lesson.id}`}>
              <Button variant="ghost" size="sm" className="w-full">
                Edit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
