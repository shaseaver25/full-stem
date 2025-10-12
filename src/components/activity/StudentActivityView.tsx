import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityLog } from '@/hooks/useActivityLog';
import { formatDistanceToNow } from 'date-fns';
import { FileCheck, BookOpen, GraduationCap, Loader2 } from 'lucide-react';

const getStudentActivityIcon = (action: string) => {
  if (action.toLowerCase().includes('submit')) return FileCheck;
  if (action.toLowerCase().includes('complete') || action.toLowerCase().includes('lesson')) return BookOpen;
  return GraduationCap;
};

export const StudentActivityView = () => {
  const { activities, isLoading } = useActivityLog({ limit: 50 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Activity</CardTitle>
        <CardDescription>Track your learning progress and submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity yet. Start learning!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getStudentActivityIcon(activity.action);
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <div className="mt-1">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{activity.action}</p>
                    {activity.details?.assignment_title && (
                      <p className="text-sm text-muted-foreground">
                        Assignment: {activity.details.assignment_title}
                      </p>
                    )}
                    {activity.details?.lesson_title && (
                      <p className="text-sm text-muted-foreground">
                        Lesson: {activity.details.lesson_title}
                      </p>
                    )}
                    {activity.details?.class_title && (
                      <p className="text-sm text-muted-foreground">
                        Class: {activity.details.class_title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
