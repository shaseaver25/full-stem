import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActivityLog } from '@/hooks/useActivityLog';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Users, FileCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';

const getTeacherActivityIcon = (action: string) => {
  if (action.toLowerCase().includes('grade')) return Edit;
  if (action.toLowerCase().includes('student') || action.toLowerCase().includes('class')) return Users;
  return FileCheck;
};

export const TeacherActivityView = () => {
  const [filter, setFilter] = useState<'all' | 'mine' | 'students'>('all');
  const { activities, isLoading } = useActivityLog({ 
    limit: 100,
    roleFilter: filter === 'students' ? 'student' : filter === 'mine' ? 'teacher' : undefined 
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Activity</CardTitle>
        <CardDescription>Monitor your classes and student engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="mine">My Actions</TabsTrigger>
            <TabsTrigger value="students">Student Activity</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {activities.map((activity) => {
              const Icon = getTeacherActivityIcon(activity.action);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="mt-1">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {activity.role}
                      </span>
                    </div>
                    {activity.profiles?.full_name && (
                      <p className="text-xs text-muted-foreground">
                        by {activity.profiles.full_name}
                      </p>
                    )}
                    {activity.details && (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {activity.details.assignment_title && (
                          <p>Assignment: {activity.details.assignment_title}</p>
                        )}
                        {activity.details.class_title && (
                          <p>Class: {activity.details.class_title}</p>
                        )}
                        {activity.details.student_name && (
                          <p>Student: {activity.details.student_name}</p>
                        )}
                      </div>
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
