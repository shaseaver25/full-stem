import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useActivityLog } from '@/hooks/useActivityLog';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileCheck, 
  Edit, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Settings,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { useState } from 'react';

const getActivityIcon = (action: string) => {
  if (action.toLowerCase().includes('submit')) return FileCheck;
  if (action.toLowerCase().includes('grade')) return Edit;
  if (action.toLowerCase().includes('lesson') || action.toLowerCase().includes('complete')) return BookOpen;
  if (action.toLowerCase().includes('message') || action.toLowerCase().includes('feedback')) return MessageSquare;
  if (action.toLowerCase().includes('class') || action.toLowerCase().includes('enroll')) return Users;
  if (action.toLowerCase().includes('setting')) return Settings;
  return GraduationCap;
};

interface ActivityLogCardProps {
  title?: string;
  showRoleFilter?: boolean;
  maxItems?: number;
}

export const ActivityLogCard = ({ 
  title = 'Recent Activity',
  showRoleFilter = false,
  maxItems = 5
}: ActivityLogCardProps) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('week');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  
  const { activities, isLoading } = useActivityLog({ 
    timeFilter, 
    roleFilter,
    limit: maxItems 
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
            <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {showRoleFilter && (
          <Tabs value={roleFilter || 'all'} onValueChange={(v) => setRoleFilter(v === 'all' ? undefined : v)} className="mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="student">Students</TabsTrigger>
              <TabsTrigger value="teacher">Teachers</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity recorded yet
          </p>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, maxItems).map((activity) => {
              const Icon = getActivityIcon(activity.action);
              return (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="mt-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    {activity.profiles?.full_name && (
                      <p className="text-xs text-muted-foreground">
                        by {activity.profiles.full_name}
                      </p>
                    )}
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {activity.details.assignment_title || 
                         activity.details.class_title || 
                         activity.details.lesson_title ||
                         ''}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
