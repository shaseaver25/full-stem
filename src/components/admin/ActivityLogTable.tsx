import React, { useState } from 'react';
import { useAdminActivity } from '@/hooks/useAdminActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Search } from 'lucide-react';
import { format } from 'date-fns';

export const ActivityLogTable = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { activities, isLoading } = useAdminActivity(timeFilter);

  const filteredActivities = activities?.filter((activity) =>
    activity.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Activity Log
        </CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
        ) : filteredActivities && filteredActivities.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Admin Type</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.action}</TableCell>
                    <TableCell>{activity.admin_type || '-'}</TableCell>
                    <TableCell>{activity.organization_name || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {activity.details && Object.keys(activity.details).length > 0
                        ? JSON.stringify(activity.details)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No activities found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
};
