
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { Assignment } from '@/types/buildClassTypes';

interface AssignmentsFormProps {
  assignments: Assignment[];
  currentAssignment: Partial<Assignment>;
  setCurrentAssignment: React.Dispatch<React.SetStateAction<Partial<Assignment>>>;
  addAssignment: () => void;
  removeAssignment: (id: string) => void;
}

const AssignmentsForm: React.FC<AssignmentsFormProps> = ({
  assignments,
  currentAssignment,
  setCurrentAssignment,
  addAssignment,
  removeAssignment
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Assignment Title</Label>
            <Input
              value={currentAssignment.title || ''}
              onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})}
              placeholder="Enter assignment title"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={currentAssignment.description || ''}
              onChange={(e) => setCurrentAssignment({...currentAssignment, description: e.target.value})}
              placeholder="Assignment overview"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={currentAssignment.dueDate || ''}
                onChange={(e) => setCurrentAssignment({...currentAssignment, dueDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Points</Label>
              <Input
                type="number"
                value={currentAssignment.maxPoints || 100}
                onChange={(e) => setCurrentAssignment({...currentAssignment, maxPoints: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea
              value={currentAssignment.instructions || ''}
              onChange={(e) => setCurrentAssignment({...currentAssignment, instructions: e.target.value})}
              placeholder="Detailed assignment instructions"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Grading Rubric</Label>
            <Textarea
              value={currentAssignment.rubric || ''}
              onChange={(e) => setCurrentAssignment({...currentAssignment, rubric: e.target.value})}
              placeholder="Grading criteria and rubric"
              rows={4}
            />
          </div>

          <Button onClick={addAssignment} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{assignment.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAssignment(assignment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {assignment.dueDate || 'No due date'}
                  </span>
                  <span>{assignment.maxPoints} points</span>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="text-gray-500 text-center py-8">No assignments added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentsForm;
