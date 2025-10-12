import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminActivity } from '@/hooks/useAdminActivity';
import { Activity, Clock, FileEdit, UserPlus, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const getActivityIcon = (action: string) => {
  if (action.includes('Created')) return <FileEdit className="h-4 w-4" />;
  if (action.includes('Role')) return <UserPlus className="h-4 w-4" />;
  if (action.includes('Setting')) return <Settings className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
};

export const RecentActivityCard = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('today');
  const { activities, isLoading } = useAdminActivity(timeFilter);
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/advanced?tab=activity')}
          >
            View All
          </Button>
        </div>
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)} className="mt-4">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="all">All Activity</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading activities...</div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {JSON.stringify(activity.details).substring(0, 100)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">
            No activity recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
