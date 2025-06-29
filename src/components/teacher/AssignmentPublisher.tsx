
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { publishAssignment, PublishAssignmentData } from '@/services/assignmentPublishingService';

interface AssignmentPublisherProps {
  classId: string;
  assignments: Array<{
    id: string;
    title: string;
    instructions: string;
    maxPoints?: number;
  }>;
  onPublished?: () => void;
}

export const AssignmentPublisher = ({ classId, assignments, onPublished }: AssignmentPublisherProps) => {
  const { toast } = useToast();
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
  const [publishSettings, setPublishSettings] = useState<Record<string, Partial<PublishAssignmentData>>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  const handleAssignmentToggle = (assignmentId: string) => {
    const newSelected = new Set(selectedAssignments);
    if (newSelected.has(assignmentId)) {
      newSelected.delete(assignmentId);
    } else {
      newSelected.add(assignmentId);
    }
    setSelectedAssignments(newSelected);
  };

  const handleSettingsChange = (assignmentId: string, field: string, value: any) => {
    setPublishSettings(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [field]: value,
      }
    }));
  };

  const handlePublishSelected = async () => {
    if (selectedAssignments.size === 0) {
      toast({
        title: "No assignments selected",
        description: "Please select at least one assignment to publish.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const assignmentId of selectedAssignments) {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) continue;

      const settings = publishSettings[assignmentId] || {};
      
      const publishData: PublishAssignmentData = {
        classAssignmentId: assignmentId,
        classId,
        title: settings.title || assignment.title,
        instructions: settings.instructions || assignment.instructions,
        maxPoints: settings.maxPoints || assignment.maxPoints || 100,
        dueDate: settings.dueDate,
        description: settings.description,
        fileTypesAllowed: settings.fileTypesAllowed,
        maxFiles: settings.maxFiles,
        allowTextResponse: settings.allowTextResponse,
      };

      const result = await publishAssignment(publishData);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setIsPublishing(false);
    
    if (successCount > 0) {
      toast({
        title: "Success!",
        description: `${successCount} assignment(s) published successfully.`,
      });
      setSelectedAssignments(new Set());
      setPublishSettings({});
      onPublished?.();
    }

    if (errorCount > 0) {
      toast({
        title: "Partial Success",
        description: `${errorCount} assignment(s) failed to publish.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Publish Assignments to Class
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <p className="text-gray-600">No assignments available to publish.</p>
          ) : (
            <>
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={selectedAssignments.has(assignment.id)}
                        onCheckedChange={() => handleAssignmentToggle(assignment.id)}
                      />
                      <div>
                        <h3 className="font-medium">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{assignment.instructions}</p>
                        <Badge variant="outline" className="mt-2">
                          {assignment.maxPoints || 100} points
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedAssignments.has(assignment.id) && (
                    <div className="mt-4 p-3 bg-gray-50 rounded space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`title-${assignment.id}`}>Title</Label>
                          <Input
                            id={`title-${assignment.id}`}
                            defaultValue={assignment.title}
                            onChange={(e) => handleSettingsChange(assignment.id, 'title', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Due Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {publishSettings[assignment.id]?.dueDate 
                                  ? format(new Date(publishSettings[assignment.id].dueDate!), 'MMM dd, yyyy')
                                  : 'Set due date'
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={publishSettings[assignment.id]?.dueDate 
                                  ? new Date(publishSettings[assignment.id].dueDate!)
                                  : undefined
                                }
                                onSelect={(date) => 
                                  handleSettingsChange(assignment.id, 'dueDate', date?.toISOString())
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`description-${assignment.id}`}>Description (optional)</Label>
                        <Textarea
                          id={`description-${assignment.id}`}
                          placeholder="Add a description for students..."
                          onChange={(e) => handleSettingsChange(assignment.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {selectedAssignments.size > 0 && (
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handlePublishSelected}
                    disabled={isPublishing}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isPublishing ? 'Publishing...' : `Publish ${selectedAssignments.size} Assignment(s)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
