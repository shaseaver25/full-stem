
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play } from 'lucide-react';

interface StudentPreviewProps {
  classId: string;
}

export const StudentPreview = ({ classId }: StudentPreviewProps) => {
  // Fetch assigned lessons for preview
  const { data: previewData, isLoading } = useQuery({
    queryKey: ['studentPreview', classId],
    queryFn: async () => {
      const { data: assignments, error: assignmentError } = await supabase
        .from('class_assignments')
        .select('*')
        .eq('class_id', classId)
        .order('assigned_date', { ascending: true });

      if (assignmentError) throw assignmentError;

      const lessonIds = assignments.map(a => a.lesson_id);
      
      const { data: lessons, error: lessonError } = await supabase
        .from('Lessons')
        .select('*')
        .in('Lesson ID', lessonIds)
        .order('Order', { ascending: true });

      if (lessonError) throw lessonError;

      return { assignments, lessons };
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading preview...</div>;
  }

  if (!previewData?.lessons?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">No lessons assigned yet. Students will see an empty course.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student View Preview</CardTitle>
          <p className="text-sm text-gray-600">
            This is how students will see their assigned lessons and content.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Progress: 0 of {previewData.lessons.length} lessons completed</span>
            <Badge variant="secondary">0%</Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {previewData.lessons.map((lesson, index) => (
          <Card key={lesson['Lesson ID']} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{lesson.Title}</h3>
                      <p className="text-sm text-gray-600">{lesson.Description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-11">
                    {lesson.Track && <Badge variant="outline">{lesson.Track}</Badge>}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~30 min
                    </Badge>
                    <Badge variant="outline">Not Started</Badge>
                  </div>
                </div>
                
                <Button variant="default" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This preview shows the student experience based on your current lesson assignments. 
            Students will see real-time progress tracking and can access assignments as you enable them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
