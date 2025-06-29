
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface StudentProgress {
  lesson_id: number;
  lesson_title: string;
  status: string;
  progress_percentage: number;
  completed_at: string;
  time_spent: number;
}

interface StudentProgressProps {
  progress: StudentProgress[];
  studentName: string;
}

const StudentProgress: React.FC<StudentProgressProps> = ({ progress, studentName }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Academic Progress
        </CardTitle>
        <CardDescription>
          {studentName}'s learning progress and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {progress.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.lesson_title}</h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.progress_percentage}% complete
                      </span>
                      {item.time_spent > 0 && (
                        <span className="text-sm text-muted-foreground">
                          • {item.time_spent} min
                        </span>
                      )}
                    </div>
                  </div>
                  {item.completed_at && (
                    <div className="text-sm text-muted-foreground">
                      Completed {new Date(item.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProgress;
