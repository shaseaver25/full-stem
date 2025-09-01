import React from 'react';
import { Button } from '@/components/ui/button';
import { useStudentManagement } from '@/hooks/useStudentManagement';
import { aiClassStudents } from '@/data/aiClassStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AddAIClassStudentsProps {
  classId: string;
}

export const AddAIClassStudents: React.FC<AddAIClassStudentsProps> = ({ classId }) => {
  const { addBulkStudents, loading } = useStudentManagement(classId);

  const handleAddStudents = async () => {
    await addBulkStudents(aiClassStudents);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add AI Class Students</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add 10 diverse student profiles specifically designed for the AI High School class
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiClassStudents.map((student, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {student.first_name} {student.last_name}
                </h4>
                <Badge variant="outline">{student.grade_level}th</Badge>
              </div>
              <div className="flex gap-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {student.reading_level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {student.learning_style}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {student.language_preference}
              </p>
              <div className="text-xs">
                <strong>Interests:</strong> {student.interests?.slice(0, 2).join(', ')}
                {student.interests && student.interests.length > 2 && '...'}
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleAddStudents} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Adding Students...' : 'Add All 10 Students to Class'}
        </Button>
      </CardContent>
    </Card>
  );
};