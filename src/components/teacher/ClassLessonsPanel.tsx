import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Users, BookOpen, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ClassLessonsPanelProps {
  classId: string;
}

export const ClassLessonsPanel = ({ classId }: ClassLessonsPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lessonToDelete, setLessonToDelete] = React.useState<string | null>(null);

  // Fetch lessons for this specific class
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['classLessons', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          activities (*)
        `)
        .eq('class_id', classId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Mutation to delete a lesson
  const deleteLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classLessons', classId] });
      toast({
        title: 'Lesson removed',
        description: 'The lesson has been removed from this class.',
      });
      setLessonToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove lesson. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting lesson:', error);
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading lessons...</div>;
  }

  if (!lessons || lessons.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons found</h3>
          <p className="text-gray-600 mb-4">This class doesn't have any lessons yet.</p>
          <Link to={`/teacher/build-class/${classId}`}>
            <Button>Add Lessons</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Class Lessons ({lessons.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLessonToDelete(lesson.id)}
                className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="flex items-start justify-between pr-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Lesson {index + 1}</Badge>
                    <h3 className="font-semibold text-lg">{lesson.title}</h3>
                  </div>
                  
                  {lesson.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
                  )}
                  
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration} min
                    </Badge>
                    {lesson.activities && lesson.activities.length > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {lesson.activities.length} activities
                      </Badge>
                    )}
                  </div>

                  {lesson.objectives && lesson.objectives.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Learning Objectives:</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        {lesson.objectives.map((objective, objIndex) => (
                          <li key={objIndex}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lesson.activities && lesson.activities.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Activities:</h4>
                      <div className="flex flex-wrap gap-1">
                        {lesson.activities.map((activity) => (
                          <Badge key={activity.id} variant="outline" className="text-xs">
                            {activity.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                  <div className="flex flex-col gap-2 ml-4">
                  <Link to={`/class-lesson/${lesson.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 w-full">
                      <Eye className="h-4 w-4" />
                      Teacher Preview
                    </Button>
                  </Link>
                  <Link to={`/student/lesson/${lesson.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 w-full">
                      <Users className="h-4 w-4" />
                      View as Student
                    </Button>
                  </Link>
                  <Link to={`/teacher/build-class/${classId}?lesson=${lesson.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Link to={`/teacher/build-class/${classId}`}>
            <Button className="w-full">
              Add More Lessons
            </Button>
          </Link>
        </div>
      </CardContent>

      <AlertDialog open={!!lessonToDelete} onOpenChange={() => setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this lesson from the class? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => lessonToDelete && deleteLesson.mutate(lessonToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};