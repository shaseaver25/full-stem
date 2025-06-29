
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { ClassroomActivity, IndividualActivity } from '@/types/buildClassTypes';

interface ClassroomActivitiesFormProps {
  activities: ClassroomActivity[];
  currentActivity: Partial<ClassroomActivity>;
  setCurrentActivity: React.Dispatch<React.SetStateAction<Partial<ClassroomActivity>>>;
  addActivity: () => void;
  removeActivity: (id: string) => void;
}

interface IndividualActivitiesFormProps {
  activities: IndividualActivity[];
  currentActivity: Partial<IndividualActivity>;
  setCurrentActivity: React.Dispatch<React.SetStateAction<Partial<IndividualActivity>>>;
  addActivity: () => void;
  removeActivity: (id: string) => void;
}

export const ClassroomActivitiesForm: React.FC<ClassroomActivitiesFormProps> = ({
  activities,
  currentActivity,
  setCurrentActivity,
  addActivity,
  removeActivity
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Classroom Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Activity Title</Label>
            <Input
              value={currentActivity.title || ''}
              onChange={(e) => setCurrentActivity({...currentActivity, title: e.target.value})}
              placeholder="Enter activity title"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={currentActivity.description || ''}
              onChange={(e) => setCurrentActivity({...currentActivity, description: e.target.value})}
              placeholder="Activity overview and description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={currentActivity.duration || 30}
              onChange={(e) => setCurrentActivity({...currentActivity, duration: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label>Materials Needed</Label>
            <Textarea
              value={currentActivity.materials?.join('\n') || ''}
              onChange={(e) => setCurrentActivity({...currentActivity, materials: e.target.value.split('\n')})}
              placeholder="One material per line"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea
              value={currentActivity.instructions || ''}
              onChange={(e) => setCurrentActivity({...currentActivity, instructions: e.target.value})}
              placeholder="Detailed activity instructions"
              rows={4}
            />
          </div>

          <Button onClick={addActivity} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Classroom Activity
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classroom Activities ({activities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{activity.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeActivity(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{activity.duration} minutes</span>
                  <Badge variant="secondary" className="text-xs">
                    Classroom
                  </Badge>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-gray-500 text-center py-8">No classroom activities added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const IndividualActivitiesForm: React.FC<IndividualActivitiesFormProps> = ({
  activities,
  currentActivity,
  setCurrentActivity,
  addActivity,
  removeActivity
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Individual Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Activity Title</Label>
            <Input
              value={currentActivity.title || ''}
              onChange={(e) => setCurrentActivity({...currentActivity, title: e.target.value})}
              placeholder="Enter activity title"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={currentActivity.description || ''}
              onChange={(e) => setCurrentActivity({...currentActivity, description: e.target.value})}
              placeholder="Activity overview and description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Estimated Time (minutes)</Label>
            <Input
              type="number"
              value={currentActivity.estimatedTime || 20}
              onChange={(e) => setCurrentActivity({...currentActivity, estimatedTime: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label>Resources</Label>
            <Textarea
              value={currentActivity.resources?.join('\n') || ''}
              onChange={(e) => setCurrentActivity({...currentActivity, resources: e.target.value.split('\n')})}
              placeholder="One resource per line"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea
              value={currentActivity.instructions || ''}
              onChange={(e) => setCurrentActivity({...currentActivity, instructions: e.target.value})}
              placeholder="Detailed activity instructions"
              rows={4}
            />
          </div>

          <Button onClick={addActivity} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Individual Activity
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Activities ({activities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{activity.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeActivity(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{activity.estimatedTime} minutes</span>
                  <Badge variant="outline" className="text-xs">
                    Individual
                  </Badge>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-gray-500 text-center py-8">No individual activities added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
