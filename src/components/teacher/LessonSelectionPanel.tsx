
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LessonSelectionPanelProps {
  classId: string;
}

export const LessonSelectionPanel = ({ classId }: LessonSelectionPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const queryClient = useQueryClient();

  // Fetch all lessons
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Lessons')
        .select('*')
        .order('Order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch currently assigned lessons for this class
  const { data: assignedLessons } = useQuery({
    queryKey: ['classAssignments', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_assignments')
        .select('lesson_id')
        .eq('class_id', classId);

      if (error) throw error;
      return data.map(item => item.lesson_id);
    },
  });

  // Save lesson assignments
  const saveAssignments = useMutation({
    mutationFn: async (lessonIds: number[]) => {
      // First, remove existing assignments
      await supabase
        .from('class_assignments')
        .delete()
        .eq('class_id', classId);

      // Then add new assignments
      if (lessonIds.length > 0) {
        const assignments = lessonIds.map(lesson_id => ({
          class_id: classId,
          lesson_id,
          assigned_date: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('class_assignments')
          .insert(assignments);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Lesson assignments saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['classAssignments', classId] });
    },
    onError: (error) => {
      console.error('Error saving assignments:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson assignments.",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (assignedLessons) {
      setSelectedLessons(assignedLessons);
    }
  }, [assignedLessons]);

  const filteredLessons = lessons?.filter(lesson => {
    const matchesSearch = !searchTerm || 
      lesson.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.Description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTrack = !trackFilter || lesson.Track === trackFilter;
    
    return matchesSearch && matchesTrack;
  });

  const uniqueTracks = [...new Set(lessons?.map(lesson => lesson.Track).filter(Boolean))];

  const handleLessonToggle = (lessonId: number) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleSave = () => {
    saveAssignments.mutate(selectedLessons);
  };

  if (isLoading) {
    return <div className="p-6">Loading lessons...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson Selection</CardTitle>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={trackFilter} onValueChange={setTrackFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tracks</SelectItem>
              {uniqueTracks.map(track => (
                <SelectItem key={track} value={track}>{track}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredLessons?.map(lesson => (
            <div key={lesson['Lesson ID']} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedLessons.includes(lesson['Lesson ID'])}
                    onCheckedChange={() => handleLessonToggle(lesson['Lesson ID'])}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{lesson.Title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{lesson.Description}</p>
                    <div className="flex gap-2 mt-2">
                      {lesson.Track && <Badge variant="outline">{lesson.Track}</Badge>}
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~30 min
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>

        {selectedLessons.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {selectedLessons.length} lesson(s) selected
              </p>
              <Button 
                onClick={handleSave}
                disabled={saveAssignments.isPending}
              >
                {saveAssignments.isPending ? 'Saving...' : 'Save Assignments'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
