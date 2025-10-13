import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, BarChart3, Plus } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  enrollment_count: number;
  current_lesson?: string;
  average_grade?: number;
}

interface ClassesListProps {
  classes: ClassItem[];
  loading: boolean;
}

export const ClassesList = ({ classes, loading }: ClassesListProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Manage your active classes</CardDescription>
        </div>
        <Link to="/teacher/build-class">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No classes yet. Create your first class to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{classItem.name}</h3>
                    <Badge variant="outline">{classItem.subject}</Badge>
                    <Badge variant="secondary">{classItem.grade_level}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{classItem.enrollment_count} students</span>
                    {classItem.current_lesson && (
                      <span>Current: {classItem.current_lesson}</span>
                    )}
                    {classItem.average_grade !== undefined && (
                      <span className="font-medium text-foreground">
                        Avg Grade: {classItem.average_grade}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/classes/${classItem.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link to={`/teacher/classes/${classItem.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/teacher/gradebook?class=${classItem.id}`}>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Grades
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
