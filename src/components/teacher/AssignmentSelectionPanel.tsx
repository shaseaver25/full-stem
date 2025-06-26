
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface AssignmentSelectionPanelProps {
  classId: string;
}

export const AssignmentSelectionPanel = ({ classId }: AssignmentSelectionPanelProps) => {
  const [assignmentSettings, setAssignmentSettings] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  // Fetch assigned lessons and their assignments
  const { data: classAssignments, isLoading } = useQuery({
    queryKey: ['classAssignmentsWithLessons', classId],
    queryFn: async () => {
      const { data: assignments, error: assignmentError } = await supabase
        .from('class_assignments')
        .select(`
          *,
          lesson_id
        `)
        .eq('class_id', classId);

      if (assignmentError) throw assignmentError;

      // Get lesson details and assignments for each lesson
      const lessonIds = assignments.map(a => a.lesson_id);
      
      const { data: lessons, error: lessonError } = await supabase
        .from('Lessons')
        .select('*')
        .in('Lesson ID', lessonIds);

      if (lessonError) throw lessonError;

      const { data: lessonAssignments, error: assignmentDetailError } = await supabase
        .from('assignments')
        .select('*')
        .in('lesson_id', lessonIds);

      if (assignmentDetailError) throw assignmentDetailError;

      return {
        classAssignments: assignments,
        lessons,
        assignments: lessonAssignments,
      };
    },
  });

  const saveAssignmentSettings = useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      // Update class_assignments with new settings
      const updatePromises = Object.entries(settings).map(([assignmentId, setting]) => {
        return supabase
          .from('class_assignments')
          .update({
            due_date: setting.dueDate,
            // Add other assignment-specific settings here
          })
          .eq('id', assignmentId);
      });

      await Promise.all(updatePromises);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Assignment settings saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error saving assignment settings:', error);
      toast({
        title: "Error",
        description: "Failed to save assignment settings.",
        variant: "destructive",
      });
    },
  });

  const handleDateChange = (assignmentId: string, date: Date | undefined) => {
    setAssignmentSettings(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        dueDate: date?.toISOString(),
      }
    }));
  };

  const handleSave = () => {
    saveAssignmentSettings.mutate(assignmentSettings);
  };

  if (isLoading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  if (!classAssignments?.lessons?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">No lessons assigned yet. Please assign lessons first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {classAssignments.lessons.map(lesson => {
            const lessonAssignments = classAssignments.assignments.filter(
              a => a.lesson_id === lesson['Lesson ID']
            );

            return (
              <div key={lesson['Lesson ID']} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">{lesson.Title}</h3>
                
                {lessonAssignments.length === 0 ? (
                  <p className="text-sm text-gray-600">No assignments available for this lesson.</p>
                ) : (
                  <div className="space-y-4">
                    {lessonAssignments.map(assignment => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <h4 className="font-medium">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{assignment.instructions}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {assignment.allow_text_response ? 'Text Response' : 'File Only'}
                            </Badge>
                            <Badge variant="secondary">
                              Max {assignment.max_files} files
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 ml-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={true}
                              onCheckedChange={() => {}}
                            />
                            <span className="text-sm">Enabled</span>
                          </div>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                <CalendarIcon className="h-4 w-4" />
                                {assignmentSettings[assignment.id]?.dueDate 
                                  ? format(new Date(assignmentSettings[assignment.id].dueDate), 'MMM dd')
                                  : 'Set Due Date'
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <Calendar
                                mode="single"
                                selected={assignmentSettings[assignment.id]?.dueDate 
                                  ? new Date(assignmentSettings[assignment.id].dueDate)
                                  : undefined
                                }
                                onSelect={(date) => handleDateChange(assignment.id, date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <Badge variant="outline">Required</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {Object.keys(assignmentSettings).length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button 
              onClick={handleSave}
              disabled={saveAssignmentSettings.isPending}
            >
              {saveAssignmentSettings.isPending ? 'Saving...' : 'Save Assignment Settings'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
